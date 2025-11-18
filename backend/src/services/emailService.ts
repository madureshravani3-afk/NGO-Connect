import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  passwordReset: (resetLink: string, firstName: string) => ({
    subject: 'Password Reset Request - NGOConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your password for your NGOConnect account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p><strong>This link will expire in 15 minutes.</strong></p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from the NGOConnect. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  welcomeEmail: (firstName: string, role: string) => ({
    subject: 'Welcome to NGOConnect!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to NGOConnect!</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for joining our platform as a ${role}. We're excited to have you on board!</p>
        ${role === 'donor' ? `
          <p>As a donor, you can:</p>
          <ul>
            <li>Post donations of food, goods, or financial contributions</li>
            <li>Find nearby verified NGOs</li>
            <li>Track your donation status in real-time</li>
            <li>Communicate directly with NGOs</li>
          </ul>
        ` : role === 'ngo' ? `
          <p>As an NGO, you can:</p>
          <ul>
            <li>Register your organization and get verified</li>
            <li>Browse and accept donations</li>
            <li>Manage donation requests</li>
            <li>Generate impact reports</li>
          </ul>
          <p><strong>Note:</strong> Your NGO registration is pending verification. You'll receive an email once it's approved.</p>
        ` : ''}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Get Started
          </a>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from the NGOConnect. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  emailVerification: (verificationLink: string, firstName: string) => ({
    subject: 'Verify Your Email - NGOConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering with the NGOConnect. Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from the NGOConnect. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  ngoRegistration: (firstName: string, organizationName: string) => ({
    subject: 'NGO Registration Received - NGOConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">NGO Registration Received</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering <strong>${organizationName}</strong> on the NGOConnect.</p>
        <p>Your NGO registration has been successfully submitted and is now under review by our verification team.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What happens next?</h3>
          <ul style="margin: 0;">
            <li>Our team will review your submitted documents</li>
            <li>We may contact you if additional information is needed</li>
            <li>You'll receive an email notification once verification is complete</li>
            <li>The verification process typically takes 2-5 business days</li>
          </ul>
        </div>
        <p>Once verified, you'll be able to:</p>
        <ul>
          <li>Browse and accept donations from donors</li>
          <li>Manage your NGO profile and preferences</li>
          <li>Generate impact reports and analytics</li>
          <li>Communicate directly with donors</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/ngo/dashboard" 
             style="background-color: #28a745; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            View Dashboard
          </a>
        </div>
        <p>If you have any questions about the verification process, please contact our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from the NGOConnect. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  ngoStatusUpdate: (firstName: string, organizationName: string, status: string, reason?: string) => ({
    subject: `NGO Verification ${status === 'verified' ? 'Approved' : 'Update'} - NGOConnect`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">NGO Verification ${status === 'verified' ? 'Approved' : 'Update'}</h2>
        <p>Hello ${firstName},</p>
        <p>We have an update regarding the verification status of <strong>${organizationName}</strong>.</p>
        
        ${status === 'verified' ? `
          <div style="background-color: #d4edda; color: #155724; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb;">
            <h3 style="margin-top: 0; color: #155724;">🎉 Congratulations! Your NGO has been verified!</h3>
            <p style="margin-bottom: 0;">Your organization is now verified and can start accepting donations on our platform.</p>
          </div>
          <p>You can now:</p>
          <ul>
            <li>Browse and accept donations from verified donors</li>
            <li>Manage donation requests and coordinate pickups</li>
            <li>Generate detailed impact reports</li>
            <li>Display your verification badge to build trust</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/ngo/dashboard" 
               style="background-color: #28a745; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Accepting Donations
            </a>
          </div>
        ` : `
          <div style="background-color: #f8d7da; color: #721c24; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #f5c6cb;">
            <h3 style="margin-top: 0; color: #721c24;">Verification Status: ${status.charAt(0).toUpperCase() + status.slice(1)}</h3>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p style="margin-bottom: 0;">Please review the feedback and update your application if needed.</p>
          </div>
          <p>You can update your NGO profile and resubmit your application through your dashboard.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/ngo/profile" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Update Profile
            </a>
          </div>
        `}
        
        <p>If you have any questions about this decision, please contact our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from the NGOConnect. Please do not reply to this email.
        </p>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to: string, template: { subject: string; html: string }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Email would be sent to:', to);
      console.log('Subject:', template.subject);
      return { success: true, message: 'Email service not configured (development mode)' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"NGOConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Specific email functions
export const sendPasswordResetEmail = async (email: string, resetLink: string, firstName: string) => {
  const template = emailTemplates.passwordReset(resetLink, firstName);
  return sendEmail(email, template);
};

export const sendWelcomeEmail = async (email: string, firstName: string, role: string) => {
  const template = emailTemplates.welcomeEmail(firstName, role);
  return sendEmail(email, template);
};

export const sendEmailVerification = async (email: string, verificationLink: string, firstName: string) => {
  const template = emailTemplates.emailVerification(verificationLink, firstName);
  return sendEmail(email, template);
};

export const sendNGORegistrationEmail = async (email: string, firstName: string, organizationName: string) => {
  const template = emailTemplates.ngoRegistration(firstName, organizationName);
  return sendEmail(email, template);
};

export const sendNGOStatusUpdateEmail = async (email: string, firstName: string, organizationName: string, status: string, reason?: string) => {
  const template = emailTemplates.ngoStatusUpdate(firstName, organizationName, status, reason);
  return sendEmail(email, template);
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { success: false, message: 'Email configuration missing' };
    }

    const transporter = createTransporter();
    await transporter.verify();
    
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return { success: false, message: 'Email configuration is invalid', error: (error as Error).message };
  }
};