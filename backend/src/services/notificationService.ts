import { IUser } from '../models/User';
import { IDonation } from '../models/Donation';
import { sendEmail } from './emailService';

export interface NotificationData {
  type: 'donation_status_change' | 'donation_accepted' | 'donation_cancelled' | 'donation_completed';
  recipient: IUser;
  donation: IDonation;
  statusChange?: {
    from: string;
    to: string;
    reason?: string;
  };
  actor?: IUser;
}

// Send notification for donation status changes
export const sendDonationStatusNotification = async (data: NotificationData): Promise<void> => {
  try {
    const { type, recipient, donation, statusChange, actor } = data;

    // Generate email content based on notification type
    let subject = '';
    let htmlContent = '';
    let textContent = '';

    switch (type) {
      case 'donation_accepted':
        subject = `Your donation "${donation.title}" has been accepted`;
        htmlContent = generateAcceptedEmailHTML(donation, actor!);
        textContent = generateAcceptedEmailText(donation, actor!);
        break;

      case 'donation_cancelled':
        subject = `Donation "${donation.title}" has been cancelled`;
        htmlContent = generateCancelledEmailHTML(donation, statusChange?.reason);
        textContent = generateCancelledEmailText(donation, statusChange?.reason);
        break;

      case 'donation_completed':
        subject = `Donation "${donation.title}" has been completed`;
        htmlContent = generateCompletedEmailHTML(donation);
        textContent = generateCompletedEmailText(donation);
        break;

      case 'donation_status_change':
        subject = `Donation "${donation.title}" status updated`;
        htmlContent = generateStatusChangeEmailHTML(donation, statusChange!);
        textContent = generateStatusChangeEmailText(donation, statusChange!);
        break;

      default:
        console.warn('Unknown notification type:', type);
        return;
    }

    // Send email notification
    await sendEmail(recipient.email, {
      subject,
      html: htmlContent
    });

    console.log(`✅ Notification sent to ${recipient.email} for donation ${donation._id}`);

  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    // Don't throw error to avoid breaking the main flow
  }
};

// Generate email content for accepted donations
const generateAcceptedEmailHTML = (donation: IDonation, acceptingNGO: IUser): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Great News! Your Donation Has Been Accepted</h2>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">Donation Details</h3>
        <p><strong>Title:</strong> ${donation.title}</p>
        <p><strong>Category:</strong> ${donation.category}</p>
        <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Accepted</span></p>
        ${donation.description ? `<p><strong>Description:</strong> ${donation.description}</p>` : ''}
      </div>

      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #059669;">Accepted By</h3>
        <p><strong>NGO:</strong> ${acceptingNGO.profile?.firstName} ${acceptingNGO.profile?.lastName}</p>
        <p><strong>Contact:</strong> ${acceptingNGO.email}</p>
        ${acceptingNGO.profile?.phone ? `<p><strong>Phone:</strong> ${acceptingNGO.profile.phone}</p>` : ''}
      </div>

      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>Next Steps:</strong> The NGO will coordinate with you for pickup or collection. 
          Please keep your donation ready and available.
        </p>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Thank you for making a difference in your community!<br>
        - The NGOConnect Team
      </p>
    </div>
  `;
};

const generateAcceptedEmailText = (donation: IDonation, acceptingNGO: IUser): string => {
  return `
Great News! Your Donation Has Been Accepted

Donation Details:
- Title: ${donation.title}
- Category: ${donation.category}
- Status: Accepted
${donation.description ? `- Description: ${donation.description}` : ''}

Accepted By:
- NGO: ${acceptingNGO.profile?.firstName} ${acceptingNGO.profile?.lastName}
- Contact: ${acceptingNGO.email}
${acceptingNGO.profile?.phone ? `- Phone: ${acceptingNGO.profile.phone}` : ''}

Next Steps: The NGO will coordinate with you for pickup or collection. Please keep your donation ready and available.

Thank you for making a difference in your community!
- The NGOConnect Team
  `;
};

// Generate email content for cancelled donations
const generateCancelledEmailHTML = (donation: IDonation, reason?: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Donation Cancelled</h2>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #dc2626;">Donation Details</h3>
        <p><strong>Title:</strong> ${donation.title}</p>
        <p><strong>Category:</strong> ${donation.category}</p>
        <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Cancelled</span></p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>

      <p style="color: #6b7280;">
        This donation has been cancelled. If you have any questions, please contact our support team.
      </p>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        - The NGOConnect Team
      </p>
    </div>
  `;
};

const generateCancelledEmailText = (donation: IDonation, reason?: string): string => {
  return `
Donation Cancelled

Donation Details:
- Title: ${donation.title}
- Category: ${donation.category}
- Status: Cancelled
${reason ? `- Reason: ${reason}` : ''}

This donation has been cancelled. If you have any questions, please contact our support team.

- The NGOConnect Team
  `;
};

// Generate email content for completed donations
const generateCompletedEmailHTML = (donation: IDonation): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">🎉 Donation Completed Successfully!</h2>
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #059669;">Donation Details</h3>
        <p><strong>Title:</strong> ${donation.title}</p>
        <p><strong>Category:</strong> ${donation.category}</p>
        <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Completed</span></p>
      </div>

      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0369a1;">Thank You for Your Generosity!</h3>
        <p>Your donation has been successfully completed and is now helping those in need. 
        Your contribution makes a real difference in the community.</p>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Thank you for being part of our mission to connect donors with those in need!<br>
        - The NGOConnect Team
      </p>
    </div>
  `;
};

const generateCompletedEmailText = (donation: IDonation): string => {
  return `
🎉 Donation Completed Successfully!

Donation Details:
- Title: ${donation.title}
- Category: ${donation.category}
- Status: Completed

Thank You for Your Generosity!
Your donation has been successfully completed and is now helping those in need. Your contribution makes a real difference in the community.

Thank you for being part of our mission to connect donors with those in need!
- The NGOConnect Team
  `;
};

// Generate email content for general status changes
const generateStatusChangeEmailHTML = (donation: IDonation, statusChange: { from: string; to: string; reason?: string }): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Donation Status Update</h2>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">Donation Details</h3>
        <p><strong>Title:</strong> ${donation.title}</p>
        <p><strong>Category:</strong> ${donation.category}</p>
        <p><strong>Status Changed:</strong> ${statusChange.from} → <strong>${statusChange.to}</strong></p>
        ${statusChange.reason ? `<p><strong>Reason:</strong> ${statusChange.reason}</p>` : ''}
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        - The NGOConnect Team
      </p>
    </div>
  `;
};

const generateStatusChangeEmailText = (donation: IDonation, statusChange: { from: string; to: string; reason?: string }): string => {
  return `
Donation Status Update

Donation Details:
- Title: ${donation.title}
- Category: ${donation.category}
- Status Changed: ${statusChange.from} → ${statusChange.to}
${statusChange.reason ? `- Reason: ${statusChange.reason}` : ''}

- The NGOConnect Team
  `;
};