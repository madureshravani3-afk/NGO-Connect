import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

const DonationRequests = ({ onAcceptDonation, onRejectDonation, onChatWithDonor }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [actionLoading, setActionLoading] = useState({});

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'food', label: 'Food' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'electronics', label: 'Electronics' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Posted' },
    { value: 'foodExpiry', label: 'Expiry Date' },
    { value: 'title', label: 'Title' }
  ];

  useEffect(() => {
    fetchAvailableDonations();
  }, [filters]);

  const fetchAvailableDonations = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        ...(filters.category && { category: filters.category })
      });

      const response = await api.get(`/api/donations/available?${queryParams}`);
      const data = response.data;
      setDonations(data.donations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccept = async (donation) => {
    try {
      setActionLoading(prev => ({ ...prev, [donation._id]: 'accepting' }));
      
      await api.post(`/api/donations/${donation._id}/accept`);

      // Remove from available donations
      setDonations(prev => prev.filter(d => d._id !== donation._id));
      onAcceptDonation?.(donation);
    } catch (err) {
      alert('Error accepting donation: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [donation._id]: null }));
    }
  };

  const handleReject = async (donation, reason = '') => {
    try {
      setActionLoading(prev => ({ ...prev, [donation._id]: 'rejecting' }));
      
      await api.post(`/api/donations/${donation._id}/reject`, { reason });

      // Remove from available donations
      setDonations(prev => prev.filter(d => d._id !== donation._id));
      onRejectDonation?.(donation);
    } catch (err) {
      alert('Error rejecting donation: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [donation._id]: null }));
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

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 6 && hoursUntilExpiry > 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) <= new Date();
  };

  if (loading && donations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Donations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              id="sortOrder"
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={fetchAvailableDonations}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Donations List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {donations.length} donation{donations.length !== 1 ? 's' : ''} available
          </h3>
          {loading && (
            <LoadingSpinner size="sm" />
          )}
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No donations available</h3>
            <p className="text-gray-600">
              {filters.category ? 
                'No donations match your current filters.' : 
                'There are no available donations at the moment.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <div key={donation._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(donation.category)}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{donation.title}</h4>
                      <p className="text-sm text-gray-500 capitalize">{donation.category}</p>
                    </div>
                  </div>
                  
                  {donation.foodExpiry && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      isExpired(donation.foodExpiry) ? 'bg-red-100 text-red-800' :
                      isExpiringSoon(donation.foodExpiry) ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {isExpired(donation.foodExpiry) ? 'Expired' :
                       isExpiringSoon(donation.foodExpiry) ? 'Expiring Soon' :
                       'Fresh'}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-3">{donation.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  {donation.category === 'financial' ? (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Amount:</span>
                      <span className="ml-2">₹{donation.amount?.toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Quantity:</span>
                      <span className="ml-2">{donation.quantity}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Pickup:</span>
                    <span className="ml-2 capitalize">{donation.pickupOption?.replace('_', ' ')}</span>
                  </div>

                  {donation.location?.address && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Location:</span>
                      <span className="ml-2 truncate">{donation.location.address}</span>
                    </div>
                  )}

                  {donation.foodExpiry && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Expires:</span>
                      <span className="ml-2">{formatDate(donation.foodExpiry)}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Posted:</span>
                    <span className="ml-2">{formatDate(donation.createdAt)}</span>
                  </div>

                  {donation.donorId && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Donor:</span>
                      <span className="ml-2">
                        {donation.donorId.profile?.firstName} {donation.donorId.profile?.lastName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Images */}
                {donation.images && donation.images.length > 0 && (
                  <div className="mb-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {donation.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={`/api/files/${image}`}
                          alt={`Donation ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                        />
                      ))}
                      {donation.images.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-gray-500">+{donation.images.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleAccept(donation)}
                    disabled={actionLoading[donation._id] || isExpired(donation.foodExpiry)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading[donation._id] === 'accepting' ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-1" />
                        Accepting...
                      </>
                    ) : (
                      '✓ Accept'
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection (optional):');
                      if (reason !== null) {
                        handleReject(donation, reason);
                      }
                    }}
                    disabled={actionLoading[donation._id]}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading[donation._id] === 'rejecting' ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-1" />
                        Rejecting...
                      </>
                    ) : (
                      '✗ Reject'
                    )}
                  </button>
                </div>

                {isExpired(donation.foodExpiry) && (
                  <p className="text-red-600 text-xs mt-2 text-center">
                    This food donation has expired and cannot be accepted
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationRequests;