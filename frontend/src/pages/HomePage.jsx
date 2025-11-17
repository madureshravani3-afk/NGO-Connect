import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user, hasRole } = useAuth();

  const getDashboardLink = () => {
    if (hasRole('donor')) return '/donate';
    if (hasRole('ngo')) return '/ngo-dashboard';
    if (hasRole('admin')) return '/admin-dashboard';
    return '/profile';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Donor-NGO Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Connecting generous donors with verified NGOs to create meaningful impact in communities across India.
            </p>
            
            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-lg">
                  Welcome back, {user?.profile?.firstName}! 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === 'donor' ? 'bg-blue-100 text-blue-800' :
                    user?.role === 'ngo' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user?.role?.toUpperCase()}
                  </span>
                </p>
                <Link
                  to={getDashboardLink()}
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform makes it easy to donate and receive donations with transparency and trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* For Donors */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">For Donors</h3>
            <p className="text-gray-600 mb-6">
              Post donations, find nearby NGOs, and track your impact with our easy-to-use platform.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Post food, goods, or financial donations</li>
              <li>• Find verified NGOs near you</li>
              <li>• Track donation status in real-time</li>
              <li>• Chat directly with NGOs</li>
            </ul>
          </div>

          {/* For NGOs */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-600 mb-4">For NGOs</h3>
            <p className="text-gray-600 mb-6">
              Get verified, manage donations, and connect with donors to maximize your organization's reach.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Get verified by our admin team</li>
              <li>• Receive donation requests</li>
              <li>• Manage pickup and delivery</li>
              <li>• Generate impact reports</li>
            </ul>
          </div>

          {/* Security & Trust */}
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-purple-600 mb-4">Secure & Trusted</h3>
            <p className="text-gray-600 mb-6">
              All NGOs are verified by our admin team to ensure transparency and trust in every donation.
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Rigorous NGO verification process</li>
              <li>• Secure payment processing</li>
              <li>• Real-time tracking and updates</li>
              <li>• 24/7 support and monitoring</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Making a Difference Together
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Verified NGOs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10K+</div>
              <div className="text-gray-600">Donations Made</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Lives Impacted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">25+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of donors and NGOs who are creating positive impact in their communities.
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Join as Donor
              </Link>
              <Link
                to="/register"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Register NGO
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;