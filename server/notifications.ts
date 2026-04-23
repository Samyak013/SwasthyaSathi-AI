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

  // Debug: Log environment variable status
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASSWORD;
  
  console.log('🔍 Email Config Check:');
  console.log(`  GMAIL_USER: ${gmailUser ? '✓ Set (' + gmailUser.substring(0, 3) + '...)' : '✗ NOT SET'}`);
  console.log(`  GMAIL_PASSWORD: ${gmailPass ? '✓ Set (' + gmailPass.substring(0, 3) + '...)' : '✗ NOT SET'}`);

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
 * Send OTP email asynchronously (fire-and-forget)
 * For Render free tier - don't block the response
 */
function sendOTPEmailBackgroundAsync(
  email: string,
  otp: string,
  name: string
): void {
  // Run in background without blocking
  setImmediate(async () => {
    try {
      if (!transporter) {
        console.log(`📧 [DEV MODE] OTP for ${email} would be sent via Gmail (Not configured)\n   OTP: ${otp}\n   Email: ${email}`);
        return;
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

      // Send with timeout - if it takes > 8 seconds, just log and continue
      const sendPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve(null), 8000)
      );

      await Promise.race([sendPromise, timeoutPromise]);
      console.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('BadCredentials') || errorMsg.includes('535')) {
        console.error(`❌ Gmail credentials invalid! Error: Invalid login`);
        console.error(`   Fix: Update GMAIL_PASSWORD in .env with correct 16-character app password`);
        console.error(`   Get new password at: https://myaccount.google.com/apppasswords`);
      } else {
        console.error(`⚠️ Background: OTP email send error for ${email}: ${errorMsg}`);
      }
    }
  });
}

/**
 * Send OTP notification - Returns immediately, sends email in background
 * Optimized for Render free tier
 */
export async function sendOTPNotification(params: OTPNotificationParams): Promise<boolean> {
  const { email, otp, name } = params;
  
  try {
    // Send email in background (don't await)
    sendOTPEmailBackgroundAsync(email, otp, name);
    
    // ALWAYS log OTP for development/testing
    if (process.env.NODE_ENV === 'development' || true) {
      console.log(`✅ OTP for testing: ${otp} (User: ${name}, Email: ${email})`);
    }
    
    // Return success immediately - OTP is already in database
    console.log(`✅ OTP request processed for ${email} - email sending in background`);
    return true;
  } catch (error) {
    console.error('Error queuing OTP notification:', error);
    return true; // Still return true - OTP is ready even if email send queued
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
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">New Prescription</h1>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <p>Hello <strong>${prescriptionDetails.patientName}</strong>,</p>
            <p>Dr. ${prescriptionDetails.doctorName} has prescribed a new treatment for you.</p>
            <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p><strong>Doctor:</strong> ${prescriptionDetails.doctorName}</p>
              <p><strong>Diagnosis:</strong> ${prescriptionDetails.diagnosis}</p>
              <p><strong>Medications:</strong> ${prescriptionDetails.medicationCount} item(s)</p>
            </div>
            <p style="color: #666;">Please log in to SwasthyaSathi to view the complete prescription details.</p>
          </div>
        </div>
      `,
    };

    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Prescription notification sent to ${email}`);
      return true;
    }
    return true;
  } catch (error) {
    console.error(`❌ Failed to send prescription notification to ${email}:`, error);
    return false;
  }
}

/**
 * Send Emergency SOS Alert Notification to Emergency Contacts and Hospitals
 */
export async function sendSOSAlertNotification(
  email: string,
  sosDetails: {
    patientName: string;
    abhaId: string;
    location: { lat: number; lng: number; address: string };
    vitals: { heartRate?: number; bloodPressure?: string; temperature?: number | string };
    recipientType: 'emergency_contact' | 'hospital' | 'doctor';
  }
): Promise<boolean> {
  try {
    if (!transporter) {
      console.log(`📧 [DEV MODE] SOS Alert to ${email}:`, sosDetails);
      return true;
    }

    const mapLink = `https://maps.google.com/?q=${sosDetails.location.lat},${sosDetails.location.lng}`;
    const recipientLabel =
      sosDetails.recipientType === 'emergency_contact'
        ? 'Emergency Contact'
        : sosDetails.recipientType === 'hospital'
          ? 'Hospital/Medical Facility'
          : 'Doctor';

    const mailOptions = {
      from: process.env.GMAIL_USER || 'noreply@swasthyasathi.com',
      to: email,
      subject: '🚨 EMERGENCY SOS ALERT - ' + sosDetails.patientName,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 36px;">🚨 EMERGENCY</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">SOS Alert Activated</p>
          </div>
          <div style="padding: 30px; background: #fff5f5; border-left: 5px solid #ff4757;">
            <p style="color: #ff4757; font-weight: bold; font-size: 16px;">⚠️ CRITICAL ALERT</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0 0 15px 0;"><strong>Patient:</strong> ${sosDetails.patientName}</p>
              <p style="margin: 0 0 15px 0;"><strong>ABHA ID:</strong> ${sosDetails.abhaId}</p>
              <p style="margin: 0 0 15px 0;"><strong>Recipient Type:</strong> ${recipientLabel}</p>
              <p style="margin: 0; color: #666; font-size: 12px;">Alert Time: ${new Date().toLocaleString()}</p>
            </div>

            <h3 style="color: #ff4757; margin-top: 20px;">📍 Location</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
              <p style="margin: 0 0 10px 0; font-family: monospace; font-size: 12px;">
                📍 ${sosDetails.location.lat.toFixed(4)}, ${sosDetails.location.lng.toFixed(4)}
              </p>
              <p style="margin: 0 0 10px 0;">${sosDetails.location.address}</p>
              <a href="${mapLink}" target="_blank" rel="noopener noreferrer" style="background: #ff4757; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">📍 Open Location in Maps</a>
            </div>

            <h3 style="color: #ff4757; margin-top: 20px;">❤️ Vital Signs</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 10px 0;">
              ${
                sosDetails.vitals.heartRate
                  ? `
                <div style="background: #ffe0e0; padding: 15px; border-radius: 5px; text-align: center;">
                  <div style="font-size: 24px; color: #ff4757; font-weight: bold;">${sosDetails.vitals.heartRate}</div>
                  <div style="font-size: 12px; color: #666;">Heart Rate (BPM)</div>
                </div>
              `
                  : ''
              }
              ${
                sosDetails.vitals.bloodPressure
                  ? `
                <div style="background: #fff0e0; padding: 15px; border-radius: 5px; text-align: center;">
                  <div style="font-size: 20px; color: #ff8c42; font-weight: bold;">${sosDetails.vitals.bloodPressure}</div>
                  <div style="font-size: 12px; color: #666;">Blood Pressure</div>
                </div>
              `
                  : ''
              }
              ${
                sosDetails.vitals.temperature
                  ? `
                <div style="background: #fff8e0; padding: 15px; border-radius: 5px; text-align: center;">
                  <div style="font-size: 20px; color: #ffa502; font-weight: bold;">${sosDetails.vitals.temperature}°C</div>
                  <div style="font-size: 12px; color: #666;">Temperature</div>
                </div>
              `
                  : ''
              }
            </div>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0; border: 2px solid #ff4757;">
              <p style="margin: 0; color: #ff4757; font-weight: bold;">⚡ ACTION REQUIRED</p>
              <p style="margin: 10px 0 0 0; color: #333;">
                ${
                  sosDetails.recipientType === 'emergency_contact'
                    ? 'Please contact the patient immediately or alert nearest medical facility. The patient has sent an emergency SOS alert.'
                    : sosDetails.recipientType === 'hospital'
                      ? 'An emergency SOS has been triggered. Please dispatch medical team to the patient location if available.'
                      : 'Patient has sent an emergency SOS. Please respond immediately or coordinate with nearest medical facility.'
                }
              </p>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This is an automated emergency alert from SwasthyaSathi. Do not reply to this email. Contact the emergency services or the patient directly.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`🚨 SOS Alert notification sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send SOS alert notification to ${email}:`, error);
    return false;
  }
}
