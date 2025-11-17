import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

const NGODashboard = ({ ngoData }) => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalValue: 0,
    recentDonations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ngos/dashboard');
      const data = response.data;
      setStats(data.stats || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'food':
        return '🍽️';
      case 'clothing':
        return '👕';
      case 'books':
        return '📚';
      case 'electronics':
        return '💻';
      case 'financial':
        return '💰';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* NGO Status Card */}
      {ngoData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{ngoData.organizationName}</h2>
              <p className="text-gray-600">Registration: {ngoData.registrationNumber}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVerificationStatusColor(ngoData.verificationStatus)}`}>
              {ngoData.verificationStatus === 'verified' ? '✓ Verified' : 
               ngoData.verificationStatus === 'pending' ? '⏳ Pending Verification' :
               ngoData.verificationStatus === 'rejected' ? '✗ Rejected' : 'Unknown Status'}
            </span>
          </div>

          {ngoData.verificationStatus === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">⏳ Verification Pending</h3>
              <p className="text-yellow-700 text-sm">
                Your NGO registration is under review. This typically takes 2-3 business days. 
                You'll receive an email notification once the verification is complete.
              </p>
            </div>
          )}

          {ngoData.verificationStatus === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Verification Rejected</h3>
              <p className="text-red-700 text-sm mb-2">
                Your NGO registration was rejected. Please contact support for more information.
              </p>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
                Contact Support
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Service Categories</h4>
              <div className="flex flex-wrap gap-2">
                {ngoData.categories?.map((category, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {getCategoryIcon(category)} {category}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Services</h4>
              <div className="space-y-1 text-sm text-gray-600">
                {ngoData.pickupService ? (
                  <div className="flex items-center text-green-600">
                    <span>🚚 Pickup service available</span>
                    {ngoData.serviceRadius && (
                      <span className="ml-2">({ngoData.serviceRadius} km radius)</span>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">No pickup service</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-blue-600">{stats.totalDonations || 0}</div>
          <div className="text-sm text-gray-600">Total Donations</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-yellow-600">{stats.activeDonations || 0}</div>
          <div className="text-sm text-gray-600">Active Donations</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-green-600">{stats.completedDonations || 0}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-purple-600">
            ₹{(stats.totalValue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/donation-requests'}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium">View Donation Requests</div>
            <div className="text-sm opacity-90">Browse available donations</div>
          </button>

          <button
            onClick={() => window.location.href = '/reports'}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Generate Reports</div>
            <div className="text-sm opacity-90">View donation analytics</div>
          </button>

          <button
            onClick={() => window.location.href = '/profile'}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-medium">Update Profile</div>
            <div className="text-sm opacity-90">Manage organization info</div>
          </button>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Donations</h3>
        
        {stats.recentDonations && stats.recentDonations.length > 0 ? (
          <div className="space-y-4">
            {stats.recentDonations.map((donation) => (
              <div key={donation._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(donation.category)}</span>
                  <div>
                    <h4 className="font-medium text-gray-800">{donation.title}</h4>
                    <p className="text-sm text-gray-600">
                      {donation.category === 'financial' ? 
                        `₹${donation.amount?.toLocaleString('en-IN')}` : 
                        donation.quantity
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    donation.status === 'collected' ? 'bg-blue-100 text-blue-800' :
                    donation.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {donation.status}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(donation.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <p>No recent donations</p>
            <p className="text-sm mt-1">Start accepting donations to see them here</p>
          </div>
        )}
      </div>

      {/* Tips and Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">💡 Tips for Success</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>• Respond quickly to donation requests to increase your acceptance rate</li>
          <li>• Keep your profile updated with current contact information</li>
          <li>• Provide clear communication about pickup arrangements</li>
          <li>• Mark donations as collected promptly to maintain good relationships</li>
          <li>• Generate regular reports to track your organization's impact</li>
        </ul>
      </div>
    </div>
  );
};

export default NGODashboard;