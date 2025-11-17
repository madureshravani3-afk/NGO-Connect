import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NGOFinder from '../../components/donor/NGOFinder';

const FindNGOsPage = () => {
  const navigate = useNavigate();
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleSelectNGO = (ngo) => {
    setSelectedNGO(ngo);
    setShowContactModal(true);
  };

  const handleContactNGO = () => {
    // Navigate to donation form with pre-selected NGO (to be implemented)
    console.log('Contact NGO:', selectedNGO);
    navigate('/donate', { 
      state: { 
        selectedNGO: selectedNGO,
        message: `You can now post a donation that ${selectedNGO.organizationName} can see.`
      }
    });
  };

  const closeModal = () => {
    setShowContactModal(false);
    setSelectedNGO(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Find NGOs Near You
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover verified NGOs in your area that can benefit from your donations. 
            Connect directly with organizations that match your donation category.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Verified NGOs</h3>
            <p className="text-sm text-gray-600">
              All NGOs are verified by our admin team to ensure legitimacy and trust.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Location-Based</h3>
            <p className="text-sm text-gray-600">
              Find NGOs near your location for easy pickup and delivery coordination.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Direct Contact</h3>
            <p className="text-sm text-gray-600">
              Connect directly with NGOs and coordinate your donations efficiently.
            </p>
          </div>
        </div>

        {/* NGO Finder Component */}
        <NGOFinder onSelectNGO={handleSelectNGO} />

        {/* Contact Modal */}
        {showContactModal && selectedNGO && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Contact {selectedNGO.organizationName}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    ✓ Verified NGO
                  </span>
                  {selectedNGO.badge && (
                    <span className="ml-2 text-xs text-gray-500">
                      {selectedNGO.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {selectedNGO.categories && (
                    <div>
                      <span className="font-medium">Categories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedNGO.categories.map((category, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedNGO.profile?.phone && (
                    <div>
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{selectedNGO.profile.phone}</span>
                    </div>
                  )}

                  {selectedNGO.profile?.address && (
                    <div>
                      <span className="font-medium">Address:</span>
                      <span className="ml-2">
                        {selectedNGO.profile.address.city}, {selectedNGO.profile.address.state}
                      </span>
                    </div>
                  )}

                  {selectedNGO.pickupService && (
                    <div className="text-green-600">
                      <span>🚚 Pickup service available</span>
                      {selectedNGO.serviceRadius && (
                        <span className="ml-2">({selectedNGO.serviceRadius} km radius)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleContactNGO}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  Post Donation for This NGO
                </button>

                {selectedNGO.profile?.phone && (
                  <a
                    href={`tel:${selectedNGO.profile.phone}`}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-center block"
                  >
                    📞 Call NGO
                  </a>
                )}

                <button
                  onClick={closeModal}
                  className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindNGOsPage;