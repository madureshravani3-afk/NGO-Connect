import { IUser } from '../models/User';
import { IDonation } from '../models/Donation';
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
export declare const sendDonationStatusNotification: (data: NotificationData) => Promise<void>;
//# sourceMappingURL=notificationService.d.ts.map