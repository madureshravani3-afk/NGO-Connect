import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      pendingNGOs: 0,
      totalDonations: 0,
      activeDonations: 0,
      totalValue: 0,
      verifiedNGOs: 0
    },
    recentActivity: [],
    systemHealth: {
      status: 'healthy',
      uptime: 0,
      responseTime: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch verification stats
      const statsResponse = await api.get('/api/admin/stats/verification');
      const statsData = statsResponse.data;
      
      // Update dashboard data with real stats
      setDashboardData({
        stats: {
          totalUsers: statsData.data?.users?.total || 0,
          pendingNGOs: statsData.data?.verification?.pending || 0,
          totalDonations: 0, // This would need a separate endpoint
          activeDonations: 0, // This would need a separate endpoint
          totalValue: 0, // This would need a separate endpoint
          verifiedNGOs: statsData.data?.verification?.verified || 0
        },
        recentActivity: [],
        systemHealth: {
          status: 'healthy',
          uptime: 0,
          responseTime: 0
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return '👤';
      case 'ngo_registration':
        return '🏢';
      case 'donation_posted':
        return '📦';
      case 'donation_completed':
        return '✅';
      case 'ngo_verified':
        return '✓';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor platform performance and manage system operations
          </p>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                dashboardData.systemHealth?.status === 'healthy' ? 'bg-green-500' :
                dashboardData.systemHealth?.status === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <div>
                <div className="text-sm text-gray-600">System Status</div>
                <div className="font-medium capitalize">
                  {dashboardData.systemHealth?.status || 'Unknown'}
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Uptime</div>
              <div className="font-medium">
                {Math.floor((dashboardData.systemHealth?.uptime || 0) / 3600)}h {Math.floor(((dashboardData.systemHealth?.uptime || 0) % 3600) / 60)}m
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
              <div className="font-medium">
                {dashboardData.systemHealth?.responseTime || 0}ms
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-blue-600">{dashboardData.stats?.totalUsers || 0}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-600">{dashboardData.stats?.verifiedNGOs || 0}</div>
            <div className="text-sm text-gray-600">Verified NGOs</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-yellow-600">{dashboardData.stats?.pendingNGOs || 0}</div>
            <div className="text-sm text-gray-600">Pending NGOs</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-purple-600">{dashboardData.stats?.totalDonations || 0}</div>
            <div className="text-sm text-gray-600">Total Donations</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-orange-600">{dashboardData.stats?.activeDonations || 0}</div>
            <div className="text-sm text-gray-600">Active Donations</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-indigo-600">
              ₹{(dashboardData.stats?.totalValue || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/verify-ngos'}
              className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-left"
            >
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-medium">Verify NGOs</div>
              <div className="text-sm opacity-90">
                {dashboardData.stats?.pendingNGOs || 0} pending
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/manage-users'}
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">Manage Users</div>
              <div className="text-sm opacity-90">
                {dashboardData.stats?.totalUsers || 0} total users
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/analytics'}
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-left"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">View Analytics</div>
              <div className="text-sm opacity-90">Platform insights</div>
            </button>

            <button
              onClick={() => window.location.href = '/profile'}
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">Settings</div>
              <div className="text-sm opacity-90">Admin preferences</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Platform Activity</h2>
          
          {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div>
                      <div className="font-medium text-gray-800">{activity.description}</div>
                      <div className="text-sm text-gray-600">{activity.details}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No recent activity</p>
              <p className="text-sm mt-1">Platform activity will appear here</p>
            </div>
          )}
        </div>

        {/* Alerts and Notifications */}
        {dashboardData.stats?.pendingNGOs > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Action Required</h3>
            <p className="text-yellow-700 mb-4">
              You have {dashboardData.stats.pendingNGOs} NGO{dashboardData.stats.pendingNGOs !== 1 ? 's' : ''} waiting for verification.
            </p>
            <button
              onClick={() => window.location.href = '/verify-ngos'}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Review NGO Applications
            </button>
          </div>
        )}

        {/* Tips for Admins */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">💡 Admin Tips</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• Regularly review and verify NGO applications to maintain platform trust</li>
            <li>• Monitor user activity for suspicious behavior or policy violations</li>
            <li>• Check platform analytics weekly to identify trends and issues</li>
            <li>• Ensure system health metrics remain within acceptable ranges</li>
            <li>• Respond promptly to user reports and support requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;