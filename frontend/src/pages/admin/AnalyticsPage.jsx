import React from 'react';
import PlatformAnalytics from '../../components/admin/PlatformAnalytics';

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Platform Analytics
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Monitor platform performance, user engagement, and donation trends. 
            Use these insights to make data-driven decisions for platform improvement.
          </p>
        </div>

        {/* Analytics Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">📊 Analytics Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">User Insights</h4>
              <ul className="text-sm opacity-90 space-y-1">
                <li>• User registration trends</li>
                <li>• Role distribution analysis</li>
                <li>• User engagement metrics</li>
                <li>• Geographic distribution</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Donation Analytics</h4>
              <ul className="text-sm opacity-90 space-y-1">
                <li>• Donation volume trends</li>
                <li>• Category performance</li>
                <li>• Completion rates</li>
                <li>• Value distribution</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Platform Health</h4>
              <ul className="text-sm opacity-90 space-y-1">
                <li>• System performance metrics</li>
                <li>• User satisfaction scores</li>
                <li>• Error rates and issues</li>
                <li>• Growth projections</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Platform Analytics Component */}
        <PlatformAnalytics />

        {/* Insights and Recommendations */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💡 Key Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Growth Opportunities</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <strong>Peak Hours:</strong> Most donations are posted between 6-9 PM. Consider targeted notifications during these hours.</li>
                <li>• <strong>Category Trends:</strong> Food donations show highest completion rates. Promote success stories to encourage more food donations.</li>
                <li>• <strong>Geographic Gaps:</strong> Identify underserved areas and focus NGO recruitment efforts there.</li>
                <li>• <strong>Seasonal Patterns:</strong> Plan campaigns around festivals and holidays when donation activity typically increases.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Areas for Improvement</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <strong>Response Time:</strong> Work with NGOs to improve average response time to donation requests.</li>
                <li>• <strong>User Retention:</strong> Implement engagement strategies for users who haven't been active recently.</li>
                <li>• <strong>Verification Speed:</strong> Streamline NGO verification process to reduce waiting times.</li>
                <li>• <strong>Mobile Usage:</strong> Optimize mobile experience as majority of users access via mobile devices.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export and Reporting */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">📈 Reporting & Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-medium text-green-800 mb-1">Executive Reports</h4>
              <p className="text-sm text-green-700 mb-3">
                High-level summaries for stakeholders and board meetings.
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                Generate Report
              </button>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-medium text-green-800 mb-1">Operational Reports</h4>
              <p className="text-sm text-green-700 mb-3">
                Detailed operational metrics for day-to-day management.
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                Generate Report
              </button>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-medium text-green-800 mb-1">Custom Analytics</h4>
              <p className="text-sm text-green-700 mb-3">
                Create custom reports for specific metrics and time periods.
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                Create Custom
              </button>
            </div>
          </div>
        </div>

        {/* Data Privacy Notice */}
        <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Data Privacy:</strong> All analytics data is aggregated and anonymized to protect user privacy. 
            Individual user information is never exposed in analytics reports. Data retention follows platform privacy policy guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;