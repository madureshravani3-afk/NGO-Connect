import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DonationHistory from '../../components/donor/DonationHistory';

const DonationsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Check for success message from donation posting
    if (location.state?.message) {
      setNotification({
        message: location.state.message,
        type: location.state.type || 'success'
      });
      
      // Clear the state to prevent showing the message on refresh
      navigate(location.pathname, { replace: true });
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  }, [location, navigate]);

  const handleEditDonation = (donation) => {
    // Navigate to edit page (to be implemented)
    console.log('Edit donation:', donation);
    // navigate(`/donate/edit/${donation._id}`);
  };

  const handleDeleteDonation = (donation) => {
    // Show success notification
    setNotification({
      message: 'Donation deleted successfully',
      type: 'success'
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleChatWithNGO = (donation) => {
    // Navigate to chat page (to be implemented)
    console.log('Chat with NGO for donation:', donation);
    // navigate(`/chat/${donation._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              My Donations
            </h1>
            <p className="text-gray-600">
              Track and manage all your donations in one place
            </p>
          </div>
          <button
            onClick={() => navigate('/donate')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            + Post New Donation
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${
            notification.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex justify-between items-center">
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="text-lg font-bold ml-4 hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Donation History Component */}
        <DonationHistory
          onEditDonation={handleEditDonation}
          onDeleteDonation={handleDeleteDonation}
          onChatWithNGO={handleChatWithNGO}
        />
      </div>
    </div>
  );
};

export default DonationsPage;