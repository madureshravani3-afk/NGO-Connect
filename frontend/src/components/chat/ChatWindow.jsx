import { FaUtensils, FaTshirt, FaBook, FaLaptop, FaMoneyBill, FaBox } from 'react-icons/fa';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatWindow = ({ donationId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donation, setDonation] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (donationId) {
      fetchChatData();
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [donationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/${donationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat data');
      }

      const data = await response.json();
      setMessages(data.messages || []);
      setDonation(data.donation);
      
      // Determine the other participant
      if (data.donation) {
        if (user.role === 'donor') {
          setOtherParticipant(data.donation.acceptedBy);
        } else {
          setOtherParticipant(data.donation.donorId);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    // Initialize Socket.io connection (placeholder for now)
    // In a real implementation, you would connect to your Socket.io server
    const mockSocket = {
      emit: (event, data) => {
        console.log('Socket emit:', event, data);
      },
      on: (event, callback) => {
        console.log('Socket on:', event);
      },
      disconnect: () => {
        console.log('Socket disconnected');
      }
    };

    setSocket(mockSocket);
    setIsConnected(true);

    // Simulate joining the chat room
    mockSocket.emit('join-chat', { donationId, userId: user._id });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText) => {
    try {
      const response = await fetch(`/api/chat/${donationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageText })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const newMessage = data.message;

      // Add message to local state
      setMessages(prev => [...prev, newMessage]);

      // Emit via socket for real-time updates
      if (socket) {
        socket.emit('send-message', {
          donationId,
          message: newMessage
        });
      }
    } catch (err) {
      alert('Error sending message: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'food':
        return <FaUtensils className="inline-block text-lg mr-1" />;
      case 'clothing':
        return <FaTshirt className="inline-block text-lg mr-1" />;
      case 'books':
        return <FaBook className="inline-block text-lg mr-1" />;
      case 'electronics':
        return <FaLaptop className="inline-block text-lg mr-1" />;
      case 'financial':
        return <FaMoneyBill className="inline-block text-lg mr-1" />;
      default:
        return <FaBox className="inline-block text-lg mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={fetchChatData}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getCategoryIcon(donation?.category)}</span>
            <div>
              <h3 className="font-semibold text-gray-800">{donation?.title}</h3>
              <p className="text-sm text-gray-600">
                Chat with {otherParticipant?.profile?.firstName} {otherParticipant?.profile?.lastName}
                {otherParticipant?.organizationName && ` (${otherParticipant.organizationName})`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
      </div>

      {/* Donation Info */}
      <div className="p-3 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              <span className="font-medium">Status:</span> 
              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                donation?.status === 'completed' ? 'bg-green-100 text-green-800' :
                donation?.status === 'collected' ? 'bg-blue-100 text-blue-800' :
                donation?.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {donation?.status}
              </span>
            </span>
            
            {donation?.category === 'financial' ? (
              <span className="text-gray-600">
                <span className="font-medium">Amount:</span> ₹{donation?.amount?.toLocaleString('en-IN')}
              </span>
            ) : (
              <span className="text-gray-600">
                <span className="font-medium">Quantity:</span> {donation?.quantity}
              </span>
            )}
          </div>
          
          <span className="text-gray-500">
            Posted {formatDate(donation?.createdAt)}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          currentUserId={user._id}
          otherParticipant={otherParticipant}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200">
        <MessageInput 
          onSendMessage={handleSendMessage}
          disabled={!isConnected || donation?.status === 'completed'}
          placeholder={
            donation?.status === 'completed' 
              ? 'This donation has been completed. Chat is now read-only.'
              : 'Type your message...'
          }
        />
      </div>

      {/* Chat Guidelines */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <p className="text-xs text-gray-500">
          💡 <strong>Chat Guidelines:</strong> Be respectful and professional. 
          Share contact details and coordinate pickup/delivery arrangements. 
          Report any inappropriate behavior to our support team.
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;