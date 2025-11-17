import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [actionLoading, setActionLoading] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'donor', label: 'Donors' },
    { value: 'ngo', label: 'NGOs' },
    { value: 'admin', label: 'Admins' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'banned', label: 'Banned' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Joined' },
    { value: 'email', label: 'Email' },
    { value: 'role', label: 'Role' },
    { value: 'isActive', label: 'Status' }
  ];

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await api.get(`/api/admin/users?${queryParams}`);
      const data = response.data;
      setUsers(data.users || []);
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

  const handleSuspendUser = async (userId, reason) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: 'suspending' }));
      
      await api.post(`/api/admin/users/${userId}/suspend`, { reason });

      // Update user in list
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isActive: false, suspensionReason: reason }
          : user
      ));
      
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert('Error suspending user: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: 'activating' }));
      
      await api.post(`/api/admin/users/${userId}/activate`);

      // Update user in list
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isActive: true, suspensionReason: null }
          : user
      ));
    } catch (err) {
      alert('Error activating user: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'donor':
        return 'bg-blue-100 text-blue-800';
      case 'ngo':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">User Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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
            onClick={fetchUsers}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Users ({users.length})
          </h3>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No users found</h3>
            <p className="text-gray-600">
              {filters.search || filters.role || filters.status ? 
                'No users match your current filters.' : 
                'No users in the system yet.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.profile?.phone && (
                            <div className="text-sm text-gray-500">{user.profile.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                      {!user.isActive && user.suspensionReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {user.suspensionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openModal(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      
                      {user.isActive ? (
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for suspension:');
                            if (reason) {
                              handleSuspendUser(user._id, reason);
                            }
                          }}
                          disabled={actionLoading[user._id]}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {actionLoading[user._id] === 'suspending' ? 'Suspending...' : 'Suspend'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user._id)}
                          disabled={actionLoading[user._id]}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          {actionLoading[user._id] === 'activating' ? 'Activating...' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">
                User Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{selectedUser.profile?.firstName} {selectedUser.profile?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{selectedUser.profile?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Role:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.isActive)}`}>
                      {selectedUser.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Joined:</span>
                    <span>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              {selectedUser.profile?.address && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Address</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    {selectedUser.profile.address.street && (
                      <div>{selectedUser.profile.address.street}</div>
                    )}
                    <div>
                      {selectedUser.profile.address.city}, {selectedUser.profile.address.state}
                    </div>
                    <div>Pincode: {selectedUser.profile.address.pincode}</div>
                  </div>
                </div>
              )}

              {/* Suspension Information */}
              {!selectedUser.isActive && selectedUser.suspensionReason && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Suspension Details</h4>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-sm">
                    <div className="text-red-800">
                      <span className="font-medium">Reason:</span> {selectedUser.suspensionReason}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                {selectedUser.isActive ? (
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for suspension:');
                      if (reason) {
                        handleSuspendUser(selectedUser._id, reason);
                      }
                    }}
                    disabled={actionLoading[selectedUser._id]}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading[selectedUser._id] === 'suspending' ? 'Suspending...' : 'Suspend User'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivateUser(selectedUser._id)}
                    disabled={actionLoading[selectedUser._id]}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading[selectedUser._id] === 'activating' ? 'Activating...' : 'Activate User'}
                  </button>
                )}
                
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;