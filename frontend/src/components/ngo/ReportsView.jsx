import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

const ReportsView = () => {
  const [reportData, setReportData] = useState({
    summary: {
      totalDonations: 0,
      totalValue: 0,
      completedDonations: 0,
      averageResponseTime: 0
    },
    categoryBreakdown: [],
    monthlyTrends: [],
    donorStats: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [reportType, setReportType] = useState('summary');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        type: reportType
      });

      const response = await api.get(`/api/ngos/reports?${queryParams}`);
      const data = response.data;
      setReportData(data.report || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const exportReport = async (format) => {
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        type: reportType,
        format: format
      });

      const response = await api.get(`/api/ngos/reports/export?${queryParams}`, {
        responseType: 'blob'
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `ngo-report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting report: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
          onClick={fetchReportData}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Donation Reports</h2>
            <p className="text-gray-600">Track your organization's donation impact and performance</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('pdf')}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              📄 Export PDF
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              📊 Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              id="reportType"
              name="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="impact">Impact Report</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-blue-600">{reportData.summary?.totalDonations || 0}</div>
          <div className="text-sm text-gray-600">Total Donations</div>
          <div className="text-xs text-gray-500 mt-1">
            {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-green-600">
            ₹{(reportData.summary?.totalValue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-xs text-gray-500 mt-1">Financial donations only</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-purple-600">{reportData.summary?.completedDonations || 0}</div>
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-xs text-gray-500 mt-1">
            {reportData.summary?.totalDonations > 0 ? 
              Math.round((reportData.summary.completedDonations / reportData.summary.totalDonations) * 100) : 0}% completion rate
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-orange-600">
            {reportData.summary?.averageResponseTime || 0}h
          </div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
          <div className="text-xs text-gray-500 mt-1">Time to accept donations</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Donations by Category</h3>
        
        {reportData.categoryBreakdown && reportData.categoryBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.categoryBreakdown.map((category) => (
              <div key={category._id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCategoryIcon(category._id)}</span>
                    <span className="font-medium text-gray-800 capitalize">{category._id}</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{category.count}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {category.totalValue > 0 && (
                    <div>Total Value: ₹{category.totalValue.toLocaleString('en-IN')}</div>
                  )}
                  <div>
                    {reportData.summary?.totalDonations > 0 ? 
                      Math.round((category.count / reportData.summary.totalDonations) * 100) : 0}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No category data available for the selected period</p>
          </div>
        )}
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends</h3>
        
        {reportData.monthlyTrends && reportData.monthlyTrends.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.monthlyTrends.map((month) => (
                  <tr key={month._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {month.totalDonations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {month.completedDonations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{(month.totalValue || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📈</div>
            <p>No trend data available for the selected period</p>
          </div>
        )}
      </div>

      {/* Top Donors */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Donors</h3>
        
        {reportData.donorStats && reportData.donorStats.length > 0 ? (
          <div className="space-y-3">
            {reportData.donorStats.map((donor, index) => (
              <div key={donor._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {donor.donorInfo?.profile?.firstName} {donor.donorInfo?.profile?.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{donor.donorInfo?.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{donor.totalDonations} donations</div>
                  {donor.totalValue > 0 && (
                    <div className="text-sm text-gray-600">
                      ₹{donor.totalValue.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <p>No donor data available for the selected period</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        
        {reportData.recentActivity && reportData.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {reportData.recentActivity.map((activity) => (
              <div key={activity._id} className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getCategoryIcon(activity.category)}</span>
                  <div>
                    <div className="font-medium text-gray-800">{activity.title}</div>
                    <div className="text-sm text-gray-600">
                      {activity.category === 'financial' ? 
                        `₹${activity.amount?.toLocaleString('en-IN')}` : 
                        activity.quantity
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'collected' ? 'bg-blue-100 text-blue-800' :
                    activity.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(activity.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No recent activity for the selected period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;