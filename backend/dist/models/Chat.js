"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MessageSchema = new mongoose_1.Schema({
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
                validator: function (v) {
                    return mongoose_1.default.Types.ObjectId.isValid(v);
                },
                message: 'Invalid attachment file ID'
            }
        }]
}, {
    _id: true
});
const ChatSchema = new mongoose_1.Schema({
    donationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Donation',
        required: [true, 'Donation ID is required'],
        unique: true
    },
    participants: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
ChatSchema.index({ donationId: 1 });
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageAt: -1 });
ChatSchema.index({ 'messages.timestamp': -1 });
ChatSchema.index({ 'messages.senderId': 1 });
ChatSchema.pre('save', function (next) {
    if (this.participants.length !== 2) {
        next(new Error('Chat must have exactly 2 participants'));
    }
    else {
        next();
    }
});
ChatSchema.pre('save', function (next) {
    if (this.isModified('messages') && this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1];
        this.lastMessageAt = lastMessage.timestamp;
    }
    next();
});
ChatSchema.methods.addMessage = function (senderId, message, messageType = 'text', attachments) {
    const newMessage = {
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
ChatSchema.methods.markAsRead = function (userId, messageIds) {
    if (messageIds && messageIds.length > 0) {
        this.messages.forEach((message) => {
            if (messageIds.includes(message._id.toString()) && !message.readBy.includes(userId)) {
                message.readBy.push(userId);
            }
        });
    }
    else {
        this.messages.forEach((message) => {
            if (!message.readBy.includes(userId)) {
                message.readBy.push(userId);
            }
        });
    }
    return this.save();
};
ChatSchema.methods.getUnreadCount = function (userId) {
    return this.messages.filter((message) => !message.readBy.includes(userId) && !message.senderId.equals(userId)).length;
};
exports.Chat = mongoose_1.default.model('Chat', ChatSchema);
//# sourceMappingURL=Chat.js.map