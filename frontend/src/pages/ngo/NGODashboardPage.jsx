import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NGODashboard from '../../components/ngo/NGODashboard';
import NGORegistration from '../../components/ngo/NGORegistration';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const NGODashboardPage = () => {
  const { user } = useAuth();
  const [ngoData, setNgoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  useEffect(() => {
    fetchNGOData();
  }, []);

  const fetchNGOData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ngos/profile');
      setNgoData(response.data.ngo);
    } catch (err) {
      if (err.response?.status === 404) {
        // NGO not registered yet
        setNgoData(null);
      } else {
        setError(err.response?.data?.error?.message || 'Failed to fetch NGO data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNGORegistration = async (registrationData) => {
    try {
      setRegistrationLoading(true);
      setRegistrationError(null);

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      Object.keys(registrationData).forEach(key => {
        if (key !== 'documents') {
          if (typeof registrationData[key] === 'object') {
            formData.append(key, JSON.stringify(registrationData[key]));
          } else {
            formData.append(key, registrationData[key]);
          }
        }
      });

      // Add document files
      if (registrationData.documents && registrationData.documents.length > 0) {
        registrationData.documents.forEach((document) => {
          formData.append('documents', document);
        });
      }

      const response = await api.post('/api/ngos/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Refresh NGO data
        await fetchNGOData();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to register NGO';
      setRegistrationError(errorMessage);
    } finally {
      setRegistrationLoading(false);
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
              onClick={fetchNGOData}
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
        {!ngoData ? (
          // Show registration form if NGO is not registered
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome to the NGO Platform
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                To start receiving donations, please complete your NGO registration. 
                Our admin team will verify your organization within 2-3 business days.
              </p>
            </div>

            <NGORegistration
              onSubmit={handleNGORegistration}
              loading={registrationLoading}
              error={registrationError}
            />
          </div>
        ) : (
          // Show dashboard if NGO is registered
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                NGO Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your donations and track your organization's impact
              </p>
            </div>

            <NGODashboard ngoData={ngoData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NGODashboardPage;