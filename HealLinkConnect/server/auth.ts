import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, role, abhaId, profileData, email } = req.body;

      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required" });
      }

      if (!['doctor', 'patient', 'pharmacy'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be doctor, patient, or pharmacy" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role,
        abhaId: abhaId || null
      });

      // Create role-specific profile
      if (role === 'doctor') {
        const doctorData = {
          userId: user.id,
          name: profileData?.name || username,
          specialization: profileData?.specialization || "General Medicine",
          hospital: profileData?.hospital || "General Hospital",
          licenseNumber: profileData?.licenseNumber || `LIC_${user.id.substring(0, 8)}`,
          phone: profileData?.phone || "",
          email: profileData?.email || email
        };
        await storage.createDoctor(doctorData);
      } else if (role === 'patient') {
        const patientData = {
          userId: user.id,
          name: profileData?.name || username,
          dateOfBirth: profileData?.dateOfBirth || null,
          bloodGroup: profileData?.bloodGroup || null,
          phone: profileData?.phone || "",
          email: profileData?.email || email,
          address: profileData?.address || "",
          emergencyContact: profileData?.emergencyContact || "",
          insuranceInfo: profileData?.insuranceInfo || ""
        };
        await storage.createPatient(patientData);
      } else if (role === 'pharmacy') {
        const pharmacyData = {
          userId: user.id,
          name: profileData?.name || username,
          address: profileData?.address || "Unknown Address",
          licenseNumber: profileData?.licenseNumber || `PHARM_${user.id.substring(0, 8)}`,
          phone: profileData?.phone || "",
          email: profileData?.email || email
        };
        await storage.createPharmacy(pharmacyData);
      }

      req.login(user as any, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
