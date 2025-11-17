import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const NGORegistration = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    registrationNumber: '',
    categories: [],
    pickupService: false,
    serviceRadius: 10,
    description: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [documents, setDocuments] = useState([]);

  const categoryOptions = [
    { value: 'food', label: 'Food Distribution' },
    { value: 'clothing', label: 'Clothing & Textiles' },
    { value: 'education', label: 'Education & Books' },
    { value: 'healthcare', label: 'Healthcare & Medical' }
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.organizationName.trim()) {
      errors.organizationName = 'Organization name is required';
    }
    
    if (!formData.registrationNumber.trim()) {
      errors.registrationNumber = 'Registration number is required';
    }
    
    if (formData.categories.length === 0) {
      errors.categories = 'Please select at least one category';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Organization description is required';
    }
    
    if (documents.length === 0) {
      errors.documents = 'Please upload at least one verification document';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategoryChange = (categoryValue) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryValue)
        ? prev.categories.filter(cat => cat !== categoryValue)
        : [...prev.categories, categoryValue]
    }));
    
    if (validationErrors.categories) {
      setValidationErrors(prev => ({
        ...prev,
        categories: ''
      }));
    }
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
    
    if (validationErrors.documents) {
      setValidationErrors(prev => ({
        ...prev,
        documents: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submissionData = {
        ...formData,
        documents: documents
      };
      onSubmit(submissionData);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">NGO Registration</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Registration Process</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Fill out all required information about your organization</li>
          <li>• Upload verification documents (registration certificate, tax exemption, etc.)</li>
          <li>• Submit for admin review (typically takes 2-3 business days)</li>
          <li>• Once verified, you can start receiving donations</li>
        </ul>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Organization Information</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.organizationName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your organization name"
                disabled={loading}
              />
              {validationErrors.organizationName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.organizationName}</p>
              )}
            </div>

            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.registrationNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your registration number"
                disabled={loading}
              />
              {validationErrors.registrationNumber && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.registrationNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Organization Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your organization's mission and activities..."
                disabled={loading}
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Categories</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select the types of donations your organization can handle *
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryOptions.map((category) => (
              <label
                key={category.value}
                className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                  formData.categories.includes(category.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category.value)}
                  onChange={() => handleCategoryChange(category.value)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-gray-700">
                  {category.label}
                </span>
              </label>
            ))}
          </div>
          {validationErrors.categories && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.categories}</p>
          )}
        </div>

        {/* Pickup Service */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pickup Service</h3>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="pickupService"
                checked={formData.pickupService}
                onChange={handleChange}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700">
                We provide pickup service for donations
              </span>
            </label>

            {formData.pickupService && (
              <div>
                <label htmlFor="serviceRadius" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Radius (km)
                </label>
                <select
                  id="serviceRadius"
                  name="serviceRadius"
                  value={formData.serviceRadius}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={15}>15 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Document Upload */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification Documents</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload documents to verify your organization (registration certificate, tax exemption certificate, etc.) *
          </p>
          
          <input
            type="file"
            id="documents"
            name="documents"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleDocumentChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.documents ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {validationErrors.documents && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.documents}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Accepted formats: PDF, JPG, PNG (max 5MB each)
          </p>
          
          {documents.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {documents.map((file, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">📄</span>
                    <span>{file.name}</span>
                    <span className="ml-2 text-gray-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-800 mb-2">Terms and Conditions</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your organization must be legally registered and in good standing</li>
            <li>• All information provided must be accurate and verifiable</li>
            <li>• You agree to use donations for legitimate charitable purposes only</li>
            <li>• You will maintain proper records of all donations received</li>
            <li>• You understand that false information may result in account suspension</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Submitting Registration...
            </>
          ) : (
            'Submit for Verification'
          )}
        </button>
      </form>
    </div>
  );
};

export default NGORegistration;