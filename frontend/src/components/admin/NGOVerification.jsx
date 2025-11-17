import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

const NGOVerification = () => {
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingNGOs();
  }, []);

  const fetchPendingNGOs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/ngos/pending');
      const responseData = response.data;
      const ngos = responseData.data?.ngos || [];
      setPendingNGOs(ngos);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ngoId, badge = '') => {
    try {
      setActionLoading(prev => ({ ...prev, [ngoId]: 'verifying' }));
      
      // Only send badge if it has a value
      const requestData = {};
      if (badge && badge.trim()) {
        requestData.badge = badge.trim();
      }
      
      await api.post(`/api/admin/ngos/${ngoId}/verify`, requestData);

      // Remove from pending list
      setPendingNGOs(prev => prev.filter(ngo => ngo._id !== ngoId));
      setShowModal(false);
      setSelectedNGO(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      alert('Error verifying NGO: ' + errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [ngoId]: null }));
    }
  };

  const handleReject = async (ngoId, reason) => {
    try {
      setActionLoading(prev => ({ ...prev, [ngoId]: 'rejecting' }));
      
      await api.post(`/api/admin/ngos/${ngoId}/reject`, { reason });

      // Remove from pending list
      setPendingNGOs(prev => prev.filter(ngo => ngo._id !== ngoId));
      setShowModal(false);
      setSelectedNGO(null);
    } catch (err) {
      alert('Error rejecting NGO: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [ngoId]: null }));
    }
  };

  const openModal = (ngo) => {
    setSelectedNGO(ngo);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNGO(null);
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
          onClick={fetchPendingNGOs}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">NGO Verification</h2>
        <p className="text-gray-600">
          Review and verify NGO registration applications. Check documents and organization details before approval.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          {pendingNGOs.length} NGO{pendingNGOs.length !== 1 ? 's' : ''} pending verification
        </div>
      </div>

      {/* Pending NGOs List */}
      {pendingNGOs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">All caught up!</h3>
          <p className="text-gray-600">
            There are no NGOs pending verification at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingNGOs.map((ngo) => (
            <div key={ngo._id} className="bg-white rounded-lg shadow-md p-6">
              {/* NGO Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{ngo.organizationName}</h3>
                  <p className="text-sm text-gray-600">Reg: {ngo.registrationNumber}</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  Pending
                </span>
              </div>

              {/* NGO Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Categories:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ngo.categories?.map((category, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Contact:</span>
                  <div className="ml-2">
                    <div>{ngo.userId?.profile?.firstName} {ngo.userId?.profile?.lastName}</div>
                    <div>{ngo.userId?.email}</div>
                    <div>{ngo.userId?.profile?.phone}</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Address:</span>
                  <div className="ml-2">
                    {ngo.userId?.profile?.address?.street && (
                      <div>{ngo.userId.profile.address.street}</div>
                    )}
                    <div>
                      {ngo.userId?.profile?.address?.city}, {ngo.userId?.profile?.address?.state} - {ngo.userId?.profile?.address?.pincode}
                    </div>
                  </div>
                </div>

                {ngo.pickupService && (
                  <div className="text-sm text-green-600">
                    🚚 Pickup service available ({ngo.serviceRadius} km radius)
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Applied:</span>
                  <span className="ml-2">{formatDate(ngo.createdAt)}</span>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Documents:</span>
                <div className="mt-2 space-y-1">
                  {ngo.documents?.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-600">{doc.type || `Document ${index + 1}`}</span>
                      <a
                        href={`/api/files/${doc.fileId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(ngo)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  Review Details
                </button>
                
                <button
                  onClick={() => handleVerify(ngo._id)}
                  disabled={actionLoading[ngo._id]}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {actionLoading[ngo._id] === 'verifying' ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-1" />
                      Verifying...
                    </>
                  ) : (
                    '✓ Quick Verify'
                  )}
                </button>
                
                <button
                  onClick={() => {
                    const reason = prompt('Reason for rejection:');
                    if (reason) {
                      handleReject(ngo._id, reason);
                    }
                  }}
                  disabled={actionLoading[ngo._id]}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {actionLoading[ngo._id] === 'rejecting' ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-1" />
                      Rejecting...
                    </>
                  ) : (
                    '✗ Reject'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Review Modal */}
      {showModal && selectedNGO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">
                Review: {selectedNGO.organizationName}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Organization Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedNGO.organizationName}</div>
                    <div><span className="font-medium">Registration:</span> {selectedNGO.registrationNumber}</div>
                    <div><span className="font-medium">Applied:</span> {formatDate(selectedNGO.createdAt)}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Contact Person</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedNGO.userId?.profile?.firstName} {selectedNGO.userId?.profile?.lastName}</div>
                    <div><span className="font-medium">Email:</span> {selectedNGO.userId?.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedNGO.userId?.profile?.phone}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Services</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Categories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedNGO.categories?.map((category, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedNGO.pickupService && (
                      <div className="text-green-600">
                        🚚 Pickup service available ({selectedNGO.serviceRadius} km radius)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Verification Documents</h4>
                <div className="space-y-2">
                  {selectedNGO.documents?.map((doc, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">
                          {doc.type || `Document ${index + 1}`}
                        </span>
                        <a
                          href={`/api/files/${doc.fileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          View Document
                        </a>
                      </div>
                      <div className="text-sm text-gray-600">
                        File: {doc.filename}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification Actions */}
            <div className="mt-8 border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-4">Verification Decision</h4>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="badge" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Badge (Optional)
                  </label>
                  <input
                    type="text"
                    id="badge"
                    placeholder="e.g., Gold Verified, Trusted Partner"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Special badge to display with the NGO's verification status
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      const badge = document.getElementById('badge').value;
                      handleVerify(selectedNGO._id, badge);
                    }}
                    disabled={actionLoading[selectedNGO._id]}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading[selectedNGO._id] === 'verifying' ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Verifying...
                      </>
                    ) : (
                      '✓ Verify NGO'
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection:');
                      if (reason) {
                        handleReject(selectedNGO._id, reason);
                      }
                    }}
                    disabled={actionLoading[selectedNGO._id]}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading[selectedNGO._id] === 'rejecting' ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Rejecting...
                      </>
                    ) : (
                      '✗ Reject Application'
                    )}
                  </button>
                  
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGOVerification;