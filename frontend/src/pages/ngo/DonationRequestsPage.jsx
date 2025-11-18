import React, { useState } from 'react';
import { FaBolt, FaHandshake, FaClipboardList } from 'react-icons/fa';
import DonationRequests from '../../components/ngo/DonationRequests';

const DonationRequestsPage = () => {
  const [notification, setNotification] = useState(null);

  const handleAcceptDonation = (donation) => {
    setNotification({
      message: `Successfully accepted donation: ${donation.title}`,
      type: 'success'
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleRejectDonation = (donation) => {
    setNotification({
      message: `Rejected donation: ${donation.title}`,
      type: 'info'
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleChatWithDonor = (donation) => {
    // Navigate to chat page (to be implemented)
    console.log('Chat with donor for donation:', donation);
    // navigate(`/chat/${donation._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Donation Requests
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse and manage available donations from donors in your area. 
            Accept donations that match your organization's needs and capabilities.
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${
            notification.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : notification.type === 'info'
              ? 'bg-blue-100 border border-blue-400 text-blue-700'
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

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBolt className="text-blue-500 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Response</h3>
            <p className="text-sm text-gray-600">
              Respond quickly to donation requests to increase your acceptance rate and build trust with donors.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHandshake className="text-green-500 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Clear Communication</h3>
            <p className="text-sm text-gray-600">
              Communicate clearly about pickup arrangements and any special requirements for the donations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClipboardList className="text-purple-500 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Proper Documentation</h3>
            <p className="text-sm text-gray-600">
              Keep proper records of all donations received for transparency and impact reporting.
            </p>
          </div>
        </div>

        {/* Donation Requests Component */}
        <DonationRequests
          onAcceptDonation={handleAcceptDonation}
          onRejectDonation={handleRejectDonation}
          onChatWithDonor={handleChatWithDonor}
        />

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Need Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Accept donations that align with your organization's mission</li>
                <li>• Respond to requests within 24 hours when possible</li>
                <li>• Coordinate pickup times that work for both parties</li>
                <li>• Mark donations as collected promptly after pickup</li>
                <li>• Maintain good relationships with regular donors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Contact Support</h4>
              <p className="text-sm text-gray-600 mb-2">
                Having issues with donation requests? Our support team is here to help.
              </p>
              <a
                href="mailto:support@donor-ngo-platform.com"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                support@donor-ngo-platform.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationRequestsPage;