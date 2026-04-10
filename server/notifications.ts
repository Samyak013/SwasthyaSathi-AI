// Email OTP Service - Sends OTP via Gmail
// Simple, free, and reliable

import nodemailer from 'nodemailer';

// Create email transporter with Gmail credentials
let transporter: any = null;
let initialized = false;

// Initialize transporter - call this after dotenv.config()
export function initializeEmailTransporter() {
  if (initialized) return;
  initialized = true;

  if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    console.log('✅ Gmail Email OTP configured');
  } else {
    console.log('⚠️ WARNING: Set GMAIL_USER and GMAIL_PASSWORD in .env to enable real email OTP');
    console.log('   Email OTP will be logged to console for now');
  }
}

export interface OTPNotificationParams {
  email: string;
  otp: string;
  name: string;
}

/**
 * Send OTP via email
 * Uses Gmail if GMAIL_USER and GMAIL_PASSWORD are configured
 * Falls back to console logging if not configured
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  name: string
): Promise<boolean> {
  try {
    // If Gmail not configured, log to console
    if (!transporter) {
      console.log(`📧 OTP EMAIL to ${email}: ${otp}`);
      return true;
    }

    const mailOptions = {
      from: process.env.GMAIL_USER || 'noreply@swasthyasathi.com',
      to: email,
      subject: 'Your SwasthyaSathi OTP - ' + otp,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">SwasthyaSathi</h1>
            <p style="margin: 5px 0 0 0;">Your Health, Our Priority</p>
          </div>
          <div style="padding: 30px; background: #f5f5f5; border-radius: 0 0 10px 10px;">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your One-Time Password (OTP) for SwasthyaSathi is:</p>
            <div style="background: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin: 0; color: #667eea; font-size: 36px; letter-spacing: 5px;">${otp}</h2>
            </div>
            <p style="color: #666;">This OTP will expire in <strong>5 minutes</strong>. Do not share this code with anyone.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © 2024 SwasthyaSathi. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${email}`);
      return true;
    }
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error);
    return false;
  }
}

/**
 * Send OTP notification - Email only
 */
export async function sendOTPNotification(params: OTPNotificationParams): Promise<boolean> {
  const { email, otp, name } = params;

  try {
    return await sendOTPEmail(email, otp, name);
  } catch (error) {
    console.error('Error sending OTP notification:', error);
    return false;
  }
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmation(
  email: string,
  appointmentDetails: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    specialization: string;
  }
): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📅 Appointment confirmation to ${email}:`, appointmentDetails);
      return true;
    }

    const mailOptions = {
      from: process.env.GMAIL_USER || 'noreply@swasthyasathi.com',
      to: email,
      subject: 'Appointment Confirmation - SwasthyaSathi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0;">Appointment Confirmed</h1>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <p>Hello <strong>${appointmentDetails.patientName}</strong>,</p>
            <p>Your appointment has been confirmed with:</p>
            <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p><strong>Doctor:</strong> ${appointmentDetails.doctorName}</p>
              <p><strong>Specialization:</strong> ${appointmentDetails.specialization}</p>
              <p><strong>Date:</strong> ${appointmentDetails.date}</p>
              <p><strong>Time:</strong> ${appointmentDetails.time}</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    return false;
  }
}

/**
 * Send prescription notification
 */
export async function sendPrescriptionNotification(
  email: string,
  prescriptionDetails: {
    patientName: string;
    doctorName: string;
    diagnosis: string;
    medicationCount: number;
  }
): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`💊 Prescription notification to ${email}:`, prescriptionDetails);
      return true;
    }

    const mailOptions = {
      from: process.env.GMAIL_USER || 'noreply@swasthyasathi.com',
      to: email,
      subject: 'New Prescription from Dr. ' + prescriptionDetails.doctorName,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0;">📋 New Prescription</h1>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <p>Hello <strong>${prescriptionDetails.patientName}</strong>,</p>
            <p>You have received a new prescription from Dr. ${prescriptionDetails.doctorName}</p>
            <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p><strong>Diagnosis:</strong> ${prescriptionDetails.diagnosis}</p>
              <p><strong>Medications:</strong> ${prescriptionDetails.medicationCount}</p>
            </div>
            <p>Log in to SwasthyaSathi to view detailed prescription and download QR code.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending prescription notification:', error);
    return false;
  }
}
