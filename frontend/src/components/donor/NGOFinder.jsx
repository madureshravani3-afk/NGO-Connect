import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const NGOFinder = ({ onSelectNGO, selectedCategory = null }) => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: selectedCategory || '',
    radius: 10,
    searchTerm: ''
  });
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'food', label: 'Food' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyNGOs();
    }
  }, [userLocation, filters]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const fetchNearbyNGOs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: filters.radius,
        ...(filters.category && { category: filters.category }),
        ...(filters.searchTerm && { search: filters.searchTerm })
      });

      const response = await fetch(`/api/ngos/nearby?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch NGOs');
      }

      const data = await response.json();
      setNgos(data.ngos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDistance = (ngoLat, ngoLng) => {
    if (!userLocation) return null;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (ngoLat - userLocation.lat) * Math.PI / 180;
    const dLng = (ngoLng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(ngoLat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDirectionsUrl = (ngo) => {
    if (!userLocation || !ngo.profile?.address?.coordinates) return '#';
    
    return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${ngo.profile.address.coordinates.lat},${ngo.profile.address.coordinates.lng}`;
  };

  if (loading && !ngos.length) {
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
          onClick={getCurrentLocation}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Find NGOs Near You</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
              Search NGOs
            </label>
            <input
              type="text"
              id="searchTerm"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
              Radius (km)
            </label>
            <select
              id="radius"
              name="radius"
              value={filters.radius}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {ngos.length} NGO{ngos.length !== 1 ? 's' : ''} found
          </h3>
          {loading && (
            <LoadingSpinner size="sm" />
          )}
        </div>

        {ngos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No NGOs found in your area.</p>
            <p className="text-sm mt-2">Try increasing the search radius or changing the category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngos.map((ngo) => {
              const distance = ngo.profile?.address?.coordinates ? 
                calculateDistance(
                  ngo.profile.address.coordinates.lat, 
                  ngo.profile.address.coordinates.lng
                ) : null;

              return (
                <div key={ngo._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  {/* NGO Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">
                        {ngo.organizationName}
                      </h4>
                      {ngo.verificationStatus === 'verified' && (
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            ✓ Verified
                          </span>
                          {ngo.badge && (
                            <span className="ml-2 text-xs text-gray-500">
                              {ngo.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {distance && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">
                          {distance.toFixed(1)} km
                        </p>
                        <p className="text-xs text-gray-500">away</p>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  {ngo.categories && ngo.categories.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {ngo.categories.map((category, index) => (
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

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {ngo.profile?.phone && (
                      <div className="flex items-center">
                        <span className="font-medium">Phone:</span>
                        <span className="ml-2">{ngo.profile.phone}</span>
                      </div>
                    )}
                    {ngo.profile?.address?.city && (
                      <div className="flex items-center">
                        <span className="font-medium">Location:</span>
                        <span className="ml-2">
                          {ngo.profile.address.city}, {ngo.profile.address.state}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    {ngo.pickupService && (
                      <div className="flex items-center text-sm text-green-600">
                        <span>🚚 Pickup service available</span>
                        {ngo.serviceRadius && (
                          <span className="ml-2">({ngo.serviceRadius} km radius)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectNGO?.(ngo)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    >
                      Select NGO
                    </button>
                    {ngo.profile?.address?.coordinates && (
                      <a
                        href={getDirectionsUrl(ngo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium"
                      >
                        📍 Directions
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Map View</h3>
        <div className="bg-gray-100 h-64 rounded-md flex items-center justify-center">
          <p className="text-gray-500">
            Map integration will be implemented in the location services task
          </p>
        </div>
      </div>
    </div>
  );
};

export default NGOFinder;