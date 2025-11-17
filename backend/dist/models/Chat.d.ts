import mongoose, { Document } from 'mongoose';
export interface IMessage {
    senderId: mongoose.Types.ObjectId;
    message: string;
    timestamp: Date;
    readBy: mongoose.Types.ObjectId[];
    messageType: 'text' | 'image' | 'system';
    attachments?: string[];
}
export interface IChat extends Document {
    donationId: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    messages: IMessage[];
    isActive: boolean;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Chat: mongoose.Model<IChat, {}, {}, {}, mongoose.Document<unknown, {}, IChat, {}, {}> & IChat & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Chat.d.ts.map