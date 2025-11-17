import React, { useState, useEffect } from 'react';
import DonationCard from './DonationCard';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

const DonationHistory = ({ onEditDonation, onDeleteDonation, onChatWithNGO }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    totalValue: 0
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'collected', label: 'Collected' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'food', label: 'Food' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'financial', label: 'Financial' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' }
  ];

  useEffect(() => {
    fetchDonations();
  }, [filters]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category })
      });

      const response = await api.get(`/api/donations/my?${queryParams}`);
      const data = response.data.data; // Backend returns data in response.data.data
      setDonations(data.donations || []);
      calculateStats(data.donations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (donationList) => {
    const stats = {
      total: donationList.length,
      completed: donationList.filter(d => d.status === 'completed').length,
      active: donationList.filter(d => ['available', 'accepted', 'collected'].includes(d.status)).length,
      totalValue: donationList
        .filter(d => d.category === 'financial' && d.status === 'completed')
        .reduce((sum, d) => sum + (d.amount || 0), 0)
    };
    setStats(stats);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (donation) => {
    onEditDonation?.(donation);
  };

  const handleDelete = async (donation) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await api.delete(`/api/donations/${donation._id}`);

        // Refresh the list
        fetchDonations();
        onDeleteDonation?.(donation);
      } catch (err) {
        alert('Error deleting donation: ' + err.message);
      }
    }
  };

  const handleChat = (donation) => {
    onChatWithNGO?.(donation);
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Donations</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            ₹{stats.totalValue.toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-gray-600">Financial Impact</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter & Sort</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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
            onClick={fetchDonations}
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
            Your Donations ({donations.length})
          </h3>
          {loading && (
            <LoadingSpinner size="sm" />
          )}
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No donations found</h3>
            <p className="text-gray-600 mb-6">
              {filters.status || filters.category ? 
                'No donations match your current filters.' : 
                "You haven't posted any donations yet."
              }
            </p>
            {!filters.status && !filters.category && (
              <button
                onClick={() => window.location.href = '/donate'}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Post Your First Donation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onChat={handleChat}
                showActions={true}
                showStatus={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More (if pagination is implemented) */}
      {donations.length > 0 && donations.length % 10 === 0 && (
        <div className="text-center">
          <button
            onClick={() => {/* Implement load more */}}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default DonationHistory;