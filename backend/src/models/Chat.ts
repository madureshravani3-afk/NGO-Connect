import mongoose, { Document, Schema } from 'mongoose';

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

const MessageSchema = new Schema<IMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required']
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  messageType: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text',
    required: true
  },
  attachments: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid attachment file ID'
    }
  }]
}, {
  _id: true
});

const ChatSchema = new Schema<IChat>({
  donationId: {
    type: Schema.Types.ObjectId,
    ref: 'Donation',
    required: [true, 'Donation ID is required'],
    unique: true
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [MessageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
ChatSchema.index({ donationId: 1 });
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageAt: -1 });
ChatSchema.index({ 'messages.timestamp': -1 });
ChatSchema.index({ 'messages.senderId': 1 });

// Validation to ensure exactly 2 participants (donor and NGO)
ChatSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    next(new Error('Chat must have exactly 2 participants'));
  } else {
    next();
  }
});

// Update lastMessageAt when new message is added
ChatSchema.pre('save', function(next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMessage.timestamp;
  }
  next();
});

// Method to add a new message
ChatSchema.methods.addMessage = function(senderId: mongoose.Types.ObjectId, message: string, messageType: 'text' | 'image' | 'system' = 'text', attachments?: string[]) {
  const newMessage: IMessage = {
    senderId,
    message,
    timestamp: new Date(),
    readBy: [senderId],
    messageType,
    attachments
  };
  
  this.messages.push(newMessage);
  this.lastMessageAt = newMessage.timestamp;
  return this.save();
};

// Method to mark messages as read
ChatSchema.methods.markAsRead = function(userId: mongoose.Types.ObjectId, messageIds?: string[]) {
  if (messageIds && messageIds.length > 0) {
    // Mark specific messages as read
    this.messages.forEach((message: any) => {
      if (messageIds.includes(message._id.toString()) && !message.readBy.includes(userId)) {
        message.readBy.push(userId);
      }
    });
  } else {
    // Mark all messages as read for the user
    this.messages.forEach((message: IMessage) => {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
      }
    });
  }
  return this.save();
};

// Method to get unread message count for a user
ChatSchema.methods.getUnreadCount = function(userId: mongoose.Types.ObjectId): number {
  return this.messages.filter((message: IMessage) => 
    !message.readBy.includes(userId) && !message.senderId.equals(userId)
  ).length;
};

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);