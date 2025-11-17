import React from 'react';
import NGOVerification from '../../components/admin/NGOVerification';

const VerifyNGOsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            NGO Verification
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review and verify NGO registration applications. Ensure all documentation is complete 
            and organizations meet platform standards before approval.
          </p>
        </div>

        {/* Verification Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Verification Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Required Documents</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Valid NGO registration certificate</li>
                <li>• Tax exemption certificate (12A/80G)</li>
                <li>• FCRA certificate (if applicable)</li>
                <li>• Recent audit reports or financial statements</li>
                <li>• Board resolution for platform participation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Verification Checklist</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Verify organization name matches registration</li>
                <li>• Check registration number authenticity</li>
                <li>• Confirm contact person authority</li>
                <li>• Validate service categories alignment</li>
                <li>• Review organization's track record</li>
              </ul>
            </div>
          </div>
        </div>

        {/* NGO Verification Component */}
        <NGOVerification />

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Need Help with Verification?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Verification Standards</h4>
              <p className="text-sm text-gray-600 mb-2">
                All NGOs must meet our platform standards for transparency, legitimacy, and operational capacity.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Must be legally registered in India</li>
                <li>• Should have active operations for at least 1 year</li>
                <li>• Must provide valid contact information</li>
                <li>• Should align with platform's charitable purposes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Contact Support</h4>
              <p className="text-sm text-gray-600 mb-2">
                For questions about verification process or document requirements.
              </p>
              <a
                href="mailto:admin@donor-ngo-platform.com"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                admin@donor-ngo-platform.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyNGOsPage;