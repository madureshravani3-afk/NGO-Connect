import React from 'react';
import UserManagement from '../../components/admin/UserManagement';

const ManageUsersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            User Management
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Monitor and manage all platform users. Review user activity, handle disputes, 
            and maintain platform safety through user moderation tools.
          </p>
        </div>

        {/* Management Guidelines */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">⚠️ User Management Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Suspension Criteria</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Fraudulent donation posts or claims</li>
                <li>• Harassment or inappropriate behavior</li>
                <li>• Violation of platform terms of service</li>
                <li>• Suspicious account activity patterns</li>
                <li>• Repeated policy violations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Best Practices</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Always document reasons for suspension</li>
                <li>• Give users opportunity to appeal decisions</li>
                <li>• Monitor for patterns of abuse</li>
                <li>• Communicate clearly with affected users</li>
                <li>• Regular review of suspended accounts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* User Management Component */}
        <UserManagement />

        {/* Moderation Tools */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Moderation Tools & Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">User Reports</h4>
              <p className="text-sm text-gray-600 mb-3">
                Review user-reported content and behavior violations.
              </p>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
                View Reports
              </button>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Activity Logs</h4>
              <p className="text-sm text-gray-600 mb-3">
                Monitor user activity patterns and system interactions.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                View Logs
              </button>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Bulk Actions</h4>
              <p className="text-sm text-gray-600 mb-3">
                Perform bulk operations on multiple user accounts.
              </p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">
                Bulk Tools
              </button>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📞 Support & Escalation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">When to Escalate</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Legal issues or law enforcement requests</li>
                <li>• Serious safety concerns or threats</li>
                <li>• Complex disputes requiring senior review</li>
                <li>• Technical issues affecting user accounts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Contact Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Senior Admin: senior-admin@donor-ngo-platform.com</div>
                <div>Legal Team: legal@donor-ngo-platform.com</div>
                <div>Technical Support: tech-support@donor-ngo-platform.com</div>
                <div>Emergency Hotline: +91 98765 43210</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;