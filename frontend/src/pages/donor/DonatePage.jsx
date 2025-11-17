import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DonationForm from '../../components/donor/DonationForm';
import api from '../../services/api';

const DonatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmitDonation = async (donationData) => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      Object.keys(donationData).forEach(key => {
        if (key !== 'images') {
          if (typeof donationData[key] === 'object') {
            formData.append(key, JSON.stringify(donationData[key]));
          } else {
            formData.append(key, donationData[key]);
          }
        }
      });

      // Add image files
      if (donationData.images && donationData.images.length > 0) {
        donationData.images.forEach((image, index) => {
          formData.append('images', image);
        });
      }

      const response = await api.post('/api/donations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Redirect to donations page with success message
        navigate('/donations', { 
          state: { 
            message: 'Donation posted successfully!',
            type: 'success'
          }
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to post donation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Post a Donation
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share your donations with verified NGOs in your area. Every contribution makes a difference in someone's life.
          </p>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Tips for Better Donations</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Provide clear, detailed descriptions of your donation items</li>
            <li>• For food donations, ensure items are fresh and will remain good for at least 3 hours</li>
            <li>• Include photos to help NGOs better understand what you're offering</li>
            <li>• Be specific about pickup/delivery preferences and location</li>
            <li>• Respond promptly to NGO requests to ensure timely distribution</li>
          </ul>
        </div>

        {/* Donation Form */}
        <DonationForm
          onSubmit={handleSubmitDonation}
          loading={loading}
          error={error}
        />

        {/* Recent Activity */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Contact Support</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Having trouble posting your donation? Our support team is here to help.
                </p>
                <a
                  href="mailto:support@donor-ngo-platform.com"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  support@donor-ngo-platform.com
                </a>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">View Your Donations</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Track the status of your current and past donations.
                </p>
                <button
                  onClick={() => navigate('/donations')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Go to My Donations →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;