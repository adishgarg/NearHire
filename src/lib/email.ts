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

// Order notification emails
export async function sendOrderConfirmationToBuyer(
  buyerEmail: string,
  buyerName: string,
  order: {
    id: string;
    gigTitle: string;
    sellerName: string;
    price: number;
    platformFee: number;
    dueDate: string;
    requirements?: string;
  }
) {
  const totalAmount = order.price + order.platformFee;
  const orderUrl = `${APP_URL}/orders/confirmation/${order.id}`;
  const dueDate = new Date(order.dueDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

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
            margin-bottom: 16px;
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
          .order-details {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }
          .order-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .order-row:last-child {
            border-bottom: none;
            font-weight: 600;
            font-size: 18px;
            padding-top: 16px;
          }
          .highlight-box {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            border-radius: 8px;
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
            <h1>🎉 Order Confirmed!</h1>
            <p>Hi ${buyerName},</p>
            <p>Great news! Your order has been successfully placed and ${order.sellerName} has been notified.</p>
            
            <div class="order-details">
              <h3 style="margin-top: 0; color: #111827;">Order Details</h3>
              <div class="order-row">
                <span style="color: #6b7280;">Order ID</span>
                <span style="font-weight: 600;">#${order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div class="order-row">
                <span style="color: #6b7280;">Service</span>
                <span>${order.gigTitle}</span>
              </div>
              <div class="order-row">
                <span style="color: #6b7280;">Seller</span>
                <span>${order.sellerName}</span>
              </div>
              <div class="order-row">
                <span style="color: #6b7280;">Expected Delivery</span>
                <span>${dueDate}</span>
              </div>
              <div class="divider"></div>
              <div class="order-row">
                <span style="color: #6b7280;">Service Price</span>
                <span>$${order.price.toFixed(2)}</span>
              </div>
              <div class="order-row">
                <span style="color: #6b7280;">Platform Fee</span>
                <span>$${order.platformFee.toFixed(2)}</span>
              </div>
              <div class="order-row">
                <span>Total Paid</span>
                <span>$${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div class="highlight-box">
              <p style="margin: 0; color: #1e40af;"><strong>💡 What's Next?</strong></p>
              <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 14px;">
                The seller will review your requirements and start working on your order. You'll receive updates along the way, and you can message the seller anytime.
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${orderUrl}" class="button">View Order Details</a>
            </div>

            ${order.requirements ? `
              <div class="divider"></div>
              <h3 style="color: #111827;">Your Requirements</h3>
              <p style="background: #f9fafb; padding: 16px; border-radius: 8px; font-size: 14px;">
                ${order.requirements}
              </p>
            ` : ''}
          </div>
          <div class="footer">
            <p>Questions? Contact us or message the seller directly through your order page.</p>
            <p>&copy; 2026 NearHire. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: buyerEmail,
    subject: `✅ Order Confirmed - ${order.gigTitle}`,
    html,
  });
}

export async function sendNewOrderNotificationToSeller(
  sellerEmail: string,
  sellerName: string,
  order: {
    id: string;
    gigTitle: string;
    buyerName: string;
    price: number;
    dueDate: string;
    requirements?: string;
  }
) {
  const orderUrl = `${APP_URL}/orders/${order.id}`;
  const dueDate = new Date(order.dueDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

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
            margin-bottom: 16px;
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
          .order-details {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }
          .order-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .order-row:last-child {
            border-bottom: none;
          }
          .highlight-box {
            background: #dcfce7;
            border-left: 4px solid #16a34a;
            padding: 16px;
            border-radius: 8px;
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
            <h1>🎊 New Order Received!</h1>
            <p>Hi ${sellerName},</p>
            <p>Congratulations! You have a new order from ${order.buyerName}.</p>
            
            <div class="order-details">
              <h3 style="margin-top: 0; color: #111827;">Order Details</h3>
              <div class="order-row">
                <span style="color: #6b7280;">Order ID</span>
                <span style="font-weight: 600;">#${order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div class="order-row">
                <span style="color: #6b7280;">Service</span>
                <span>${order.gigTitle}</span>
              </div>
              <div class="order-row">
                <span style="color: #6b7280;">Buyer</span>
                <span>${order.buyerName}</span>
              </div>
              <div class="order-row">
                <span style="color: #6b7280;">Due Date</span>
                <span style="font-weight: 600; color: #dc2626;">${dueDate}</span>
              </div>
              <div class="order-row">
                <span style="color: #6b7280;">Your Earnings</span>
                <span style="font-weight: 600; color: #16a34a;">₹${order.price.toFixed(2)}</span>
              </div>
            </div>

            ${order.requirements ? `
              <h3 style="color: #111827;">Buyer Requirements</h3>
              <p style="background: #f9fafb; padding: 16px; border-radius: 8px; font-size: 14px; white-space: pre-wrap;">
                ${order.requirements}
              </p>
            ` : ''}

            <div class="highlight-box">
              <p style="margin: 0; color: #15803d;"><strong>⏰ Time to Get Started!</strong></p>
              <p style="margin: 8px 0 0 0; color: #15803d; font-size: 14px;">
                Review the buyer's requirements carefully and start working on the order. Don't hesitate to reach out to the buyer if you need any clarification.
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${orderUrl}" class="button">View Order & Start Working</a>
            </div>

            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              💬 You can message the buyer directly through the order page
            </p>
          </div>
          <div class="footer">
            <p>Keep up the great work! Delivering quality service leads to great reviews.</p>
            <p>&copy; 2026 NearHire. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: sellerEmail,
    subject: `🔔 New Order - ${order.gigTitle}`,
    html,
  });
}
