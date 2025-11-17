import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const DonationForm = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food',
    quantity: '',
    pickupOption: 'both',
    foodExpiry: '',
    amount: '',
    location: {
      address: '',
      coordinates: {
        lat: 28.6139, // Default coordinates for New Delhi
        lng: 77.2090
      }
    }
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [images, setImages] = useState([]);

  const categories = [
    { value: 'food', label: 'Food' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'financial', label: 'Financial' }
  ];

  const pickupOptions = [
    { value: 'pickup', label: 'Pickup from my location' },
    { value: 'dropoff', label: 'I will drop off' },
    { value: 'both', label: 'Both options available' }
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.quantity.trim() && formData.category !== 'financial') {
      errors.quantity = 'Quantity is required';
    }
    
    if (formData.category === 'financial') {
      if (!formData.amount || formData.amount <= 0) {
        errors.amount = 'Amount must be greater than 0';
      }
    }
    
    if (formData.category === 'food' && !formData.foodExpiry) {
      errors.foodExpiry = 'Expiry date/time is required for food donations';
    }
    
    if (formData.category === 'food' && formData.foodExpiry) {
      const expiryDate = new Date(formData.foodExpiry);
      const now = new Date();
      const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      
      if (expiryDate <= threeHoursFromNow) {
        errors.foodExpiry = 'Food must be valid for more than 3 hours from now';
      }
    }
    
    if (!formData.location.address.trim() || formData.location.address.trim().length < 5) {
      errors.address = 'Please provide a complete address (minimum 5 characters)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error when user starts typing
    const errorKey = name.startsWith('location.') ? name.split('.')[1] : name;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
    

  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          // Keep default coordinates if geolocation fails
          alert('Unable to get your current location. Using default location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser. Using default location.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submissionData = {
        ...formData,
        images: images
      };
      onSubmit(submissionData);
    }
  };

  // Get minimum datetime for food expiry (3 hours and 1 minute from now)
  const getMinExpiryDateTime = () => {
    const now = new Date();
    const threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000) + (1 * 60 * 1000)); // 3 hours + 1 minute
    return threeHoursFromNow.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Post a Donation</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Donation Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Fresh vegetables from my garden"
            disabled={loading}
          />
          {validationErrors.title && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
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
            placeholder="Describe your donation in detail..."
            disabled={loading}
          />
          {validationErrors.description && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
          )}
        </div>

        {/* Quantity or Amount */}
        {formData.category === 'financial' ? (
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter amount in rupees"
              disabled={loading}
            />
            {validationErrors.amount && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="text"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 5 kg, 10 pieces, 2 bags"
              disabled={loading}
            />
            {validationErrors.quantity && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.quantity}</p>
            )}
          </div>
        )}

        {/* Food Expiry (only for food category) */}
        {formData.category === 'food' && (
          <div>
            <label htmlFor="foodExpiry" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date & Time *
            </label>
            <input
              type="datetime-local"
              id="foodExpiry"
              name="foodExpiry"
              value={formData.foodExpiry}
              onChange={handleChange}
              min={getMinExpiryDateTime()}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.foodExpiry ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {validationErrors.foodExpiry && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.foodExpiry}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Food must be valid for at least 3 hours from now
            </p>
          </div>
        )}

        {/* Images (not for financial donations) */}
        {formData.category !== 'financial' && (
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload photos of your donation (optional, max 5 images)
            </p>
          </div>
        )}

        {/* Pickup Options */}
        <div>
          <label htmlFor="pickupOption" className="block text-sm font-medium text-gray-700 mb-1">
            Pickup/Delivery Option *
          </label>
          <select
            id="pickupOption"
            name="pickupOption"
            value={formData.pickupOption}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {pickupOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location.address" className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="location.address"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your complete address"
              disabled={loading}
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              📍 Current Location
            </button>
          </div>
          {validationErrors.address && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
          )}
          
          {formData.location.coordinates.lat && formData.location.coordinates.lng && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Location coordinates: {formData.location.coordinates.lat.toFixed(4)}, {formData.location.coordinates.lng.toFixed(4)}
            </p>
          )}
          
          <p className="text-sm text-gray-500 mt-1">
            Click "Current Location" to use your actual location, or we'll use a default location
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Posting Donation...
            </>
          ) : (
            'Post Donation'
          )}
        </button>
      </form>
    </div>
  );
};

export default DonationForm;