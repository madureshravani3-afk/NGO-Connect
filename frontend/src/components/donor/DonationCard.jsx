import React from 'react';
import { FaUtensils, FaTshirt, FaBook, FaLaptop, FaMoneyBill, FaBox } from 'react-icons/fa';

const DonationCard = ({ 
  donation, 
  onEdit, 
  onDelete, 
  onChat, 
  showActions = true,
  showStatus = true 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800';
      case 'collected':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'food':
        return <FaUtensils className="inline-block text-lg mr-1" />;
      case 'clothing':
        return <FaTshirt className="inline-block text-lg mr-1" />;
      case 'books':
        return <FaBook className="inline-block text-lg mr-1" />;
      case 'electronics':
        return <FaLaptop className="inline-block text-lg mr-1" />;
      case 'financial':
        return <FaMoneyBill className="inline-block text-lg mr-1" />;
      default:
        return <FaBox className="inline-block text-lg mr-1" />;
    }
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

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 6 && hoursUntilExpiry > 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) <= new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getCategoryIcon(donation.category)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{donation.title}</h3>
            <p className="text-sm text-gray-500 capitalize">{donation.category}</p>
          </div>
        </div>
        
        {showStatus && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">{donation.description}</p>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {donation.category === 'financial' ? (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Amount:</span>
            <span className="ml-2">₹{donation.amount?.toLocaleString('en-IN')}</span>
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Quantity:</span>
            <span className="ml-2">{donation.quantity}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Pickup:</span>
          <span className="ml-2 capitalize">{donation.pickupOption?.replace('_', ' ')}</span>
        </div>

        {donation.location?.address && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Location:</span>
            <span className="ml-2 truncate">{donation.location.address}</span>
          </div>
        )}

        {donation.foodExpiry && (
          <div className="flex items-center text-sm">
            <span className="font-medium text-gray-600">Expires:</span>
            <span className={`ml-2 ${
              isExpired(donation.foodExpiry) ? 'text-red-600 font-medium' :
              isExpiringSoon(donation.foodExpiry) ? 'text-orange-600 font-medium' :
              'text-gray-600'
            }`}>
              {formatDate(donation.foodExpiry)}
              {isExpired(donation.foodExpiry) && ' (Expired)'}
              {isExpiringSoon(donation.foodExpiry) && !isExpired(donation.foodExpiry) && ' (Expiring Soon)'}
            </span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Posted:</span>
          <span className="ml-2">{formatDate(donation.createdAt)}</span>
        </div>
      </div>

      {/* Accepted By (if applicable) */}
      {donation.acceptedBy && (
        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Accepted by:</span> {donation.acceptedBy.organizationName || donation.acceptedBy.profile?.firstName}
          </p>
          {donation.acceptedAt && (
            <p className="text-xs text-blue-600 mt-1">
              Accepted on {formatDate(donation.acceptedAt)}
            </p>
          )}
        </div>
      )}

      {/* Images */}
      {donation.images && donation.images.length > 0 && (
        <div className="mb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {donation.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={`/api/files/${image}`}
                alt={`Donation ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md flex-shrink-0"
              />
            ))}
            {donation.images.length > 3 && (
              <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-gray-500">+{donation.images.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2 pt-4 border-t">
          {donation.status === 'available' && (
            <>
              <button
                onClick={() => onEdit?.(donation)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(donation)}
                className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
              >
                Delete
              </button>
            </>
          )}
          
          {(donation.status === 'accepted' || donation.status === 'collected') && (
            <button
              onClick={() => onChat?.(donation)}
              className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              💬 Chat with NGO
            </button>
          )}
          
          {donation.status === 'completed' && (
            <div className="flex-1 text-center py-2 px-4 text-sm text-green-600 font-medium">
              ✅ Donation Completed
            </div>
          )}
          
          {donation.status === 'cancelled' && (
            <div className="flex-1 text-center py-2 px-4 text-sm text-red-600 font-medium">
              ❌ Donation Cancelled
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonationCard;