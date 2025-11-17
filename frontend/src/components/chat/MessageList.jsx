import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages, currentUserId, otherParticipant }) => {
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Start the conversation</h3>
          <p className="text-sm">
            Send a message to {otherParticipant?.profile?.firstName || otherParticipant?.organizationName} 
            to coordinate your donation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ maxHeight: 'calc(100vh - 300px)' }}
    >
      {Object.entries(messageGroups).map(([dateKey, dayMessages]) => (
        <div key={dateKey}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatDate(dayMessages[0].timestamp)}
            </div>
          </div>

          {/* Messages for this date */}
          {dayMessages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId;
            const showAvatar = index === 0 || dayMessages[index - 1].senderId !== message.senderId;
            const showTime = index === dayMessages.length - 1 || 
                           dayMessages[index + 1].senderId !== message.senderId ||
                           new Date(dayMessages[index + 1].timestamp) - new Date(message.timestamp) > 300000; // 5 minutes

            return (
              <div
                key={message._id || index}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  {!isCurrentUser && showAvatar && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        {otherParticipant?.profile?.firstName?.[0] || 
                         otherParticipant?.organizationName?.[0] || 
                         '?'}
                      </span>
                    </div>
                  )}
                  
                  {!isCurrentUser && !showAvatar && (
                    <div className="w-8 h-8 flex-shrink-0"></div>
                  )}

                  {/* Message Bubble */}
                  <div className="flex flex-col">
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-200 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </div>
                    
                    {/* Timestamp */}
                    {showTime && (
                      <div className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                        {isCurrentUser && message.readBy && message.readBy.length > 1 && (
                          <span className="ml-1 text-blue-500">✓✓</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Typing Indicator (placeholder) */}
      {false && (
        <div className="flex justify-start mb-2">
          <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-gray-600">
                {otherParticipant?.profile?.firstName?.[0] || 
                 otherParticipant?.organizationName?.[0] || 
                 '?'}
              </span>
            </div>
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;