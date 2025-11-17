import React from 'react';
import ReportsView from '../../components/ngo/ReportsView';

const ReportsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your organization's donation impact with comprehensive reports and analytics. 
            Generate detailed reports for stakeholders and funding applications.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Impact Tracking</h3>
            <p className="text-sm text-gray-600">
              Monitor your organization's impact with detailed donation statistics and trends over time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Metrics</h3>
            <p className="text-sm text-gray-600">
              Track key performance indicators like response time, completion rate, and donor satisfaction.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Export Reports</h3>
            <p className="text-sm text-gray-600">
              Export detailed reports in PDF or CSV format for stakeholder meetings and grant applications.
            </p>
          </div>
        </div>

        {/* Reports Component */}
        <ReportsView />

        {/* Tips Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">💡 Using Reports Effectively</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">For Stakeholders</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use summary reports for board meetings and updates</li>
                <li>• Share impact metrics with donors and supporters</li>
                <li>• Include trend analysis in annual reports</li>
                <li>• Highlight top donor relationships for recognition</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">For Operations</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Monitor response times to improve efficiency</li>
                <li>• Analyze category trends to focus efforts</li>
                <li>• Track seasonal patterns for better planning</li>
                <li>• Use donor data to build stronger relationships</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;