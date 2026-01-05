import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null;
function getResendClient() {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const resend = getResendClient();
    
    if (!resend) {
      console.error('❌ Resend client not initialized - missing API key');
      return { success: false, error: 'Email service not configured' };
    }
    
    console.log('📤 Attempting to send email:', { 
      to, 
      from: FROM_EMAIL, 
      subject,
      hasApiKey: !!process.env.RESEND_API_KEY 
    });
    
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });
    
    console.log('✅ Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${APP_URL}/auth/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5ecdf;
            color: #111827;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #111827;
          }
          .content {
            background: #ffffff;
            border-radius: 24px;
            padding: 40px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          h1 {
            color: #111827;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 16px;
          }
          p {
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .button {
            display: inline-block;
            background: #111827;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 9999px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: #1f2937;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #6b7280;
            font-size: 14px;
          }
          .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 24px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NearHire</div>
          </div>
          <div class="content">
            <h1>🎉 Verify Your Email Address</h1>
            <p>Welcome to NearHire! We're excited to have you on board.</p>
            <p>To complete your registration and start connecting with talented professionals or offering your services, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            <div class="divider"></div>
            <p style="font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 13px; word-break: break-all; color: #111827;">${verificationLink}</p>
            <p style="font-size: 14px; color: #6b7280;">This link will expire in 24 hours for security reasons.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account with NearHire, you can safely ignore this email.</p>
            <p>&copy; 2026 NearHire. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '✉️ Verify your email address - NearHire',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${APP_URL}/auth/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5ecdf;
            color: #111827;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #111827;
          }
          .content {
            background: #ffffff;
            border-radius: 24px;
            padding: 40px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          h1 {
            color: #111827;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 16px;
          }
          p {
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .button {
            display: inline-block;
            background: #111827;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 9999px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: #1f2937;
          }
          .alert {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 16px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #6b7280;
            font-size: 14px;
          }
          .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 24px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NearHire</div>
          </div>
          <div class="content">
            <h1>🔐 Reset Your Password</h1>
            <p>We received a request to reset your password for your NearHire account.</p>
            <p>Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <div class="divider"></div>
            <p style="font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 13px; word-break: break-all; color: #111827;">${resetLink}</p>
            <div class="alert">
              <p style="margin: 0; font-size: 14px; color: #991b1b;"><strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
          </div>
          <div class="footer">
            <p>For security reasons, we never send your password via email.</p>
            <p>&copy; 2026 NearHire. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🔒 Reset your password - NearHire',
    html,
  });
}

// Helper function to generate a random token
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
