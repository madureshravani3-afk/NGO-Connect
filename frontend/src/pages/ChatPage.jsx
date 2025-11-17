import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (donationId) {
      fetchDonationDetails();
    }
  }, [donationId]);

  const fetchDonationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/donations/${donationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch donation details');
      }

      const data = await response.json();
      setDonation(data.donation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <button
              onClick={handleClose}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">
              Chat about: {donation?.title}
            </h1>
            <p className="text-gray-600 mt-1">
              Coordinate pickup and delivery details with the other party
            </p>
          </div>

          {/* Chat Window */}
          <div className="bg-white rounded-lg shadow-lg" style={{ height: 'calc(100vh - 200px)' }}>
            <ChatWindow 
              donationId={donationId} 
              onClose={handleClose}
            />
          </div>

          {/* Chat Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Chat Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be clear about pickup/delivery times and locations</li>
              <li>• Share contact details for easier coordination</li>
              <li>• Confirm donation details before meeting</li>
              <li>• Report any issues to our support team</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;