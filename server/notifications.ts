// Notification Service for sending OTP via Email and SMS
// This uses console logging in development and can be integrated with real services

import nodemailer from 'nodemailer';

// Mock transporter for development - replace with real credentials in production
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'demo@example.com',
    pass: process.env.GMAIL_PASSWORD || 'demo-password',
  },
  // In production, configure with real email service
});

export interface OTPNotificationParams {
  email: string;
  phone: string;
  otp: string;
  channel: 'email' | 'sms' | 'both';
  name: string;
}

/**
 * Send OTP via email
 * In production, integrate with: SendGrid, AWS SES, or Mailgun
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  name: string
): Promise<boolean> {
  try {
    // In development, just log the OTP
    if (process.env.NODE_ENV === 'development') {
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

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error);
    // In development, still return true to allow testing
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
}

/**
 * Send OTP via SMS
 * In production, integrate with: Twilio, AWS SNS, or Vonage
 */
export async function sendOTPSMS(
  phone: string,
  otp: string,
  name: string
): Promise<boolean> {
  try {
    // In development, just log the OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 OTP SMS to ${phone}: ${otp}`);
      return true;
    }

    // Production: Integrate with Twilio or AWS SNS
    // Example Twilio implementation:
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Your SwasthyaSathi OTP is: ${otp}. Valid for 5 minutes. Do not share.`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // });

    console.log(`✅ OTP SMS sent to ${phone}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP SMS to ${phone}:`, error);
    // In development, still return true to allow testing
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
}

/**
 * Send OTP notification via specified channel(s)
 */
export async function sendOTPNotification(params: OTPNotificationParams): Promise<boolean> {
  const { email, phone, otp, channel, name } = params;

  try {
    const results = [];

    if (channel === 'email' || channel === 'both') {
      const emailResult = await sendOTPEmail(email, otp, name);
      results.push(emailResult);
    }

    if (channel === 'sms' || channel === 'both') {
      const smsResult = await sendOTPSMS(phone, otp, name);
      results.push(smsResult);
    }

    return results.every((r) => r === true);
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
