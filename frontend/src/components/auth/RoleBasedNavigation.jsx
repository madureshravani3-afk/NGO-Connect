import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ChatNotifications from '../chat/ChatNotifications';

const RoleBasedNavigation = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showChatModal, setShowChatModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleChatOpen = (donationId) => {
    navigate(`/chat/${donationId}`);
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        { path: '/', label: 'Home' },
        { path: '/login', label: 'Login' },
        { path: '/register', label: 'Register' }
      ];
    }

    const commonItems = [
      { path: '/', label: 'Home' },
      { path: '/profile', label: 'Profile' }
    ];

    if (hasRole('donor')) {
      return [
        ...commonItems,
        { path: '/donate', label: 'Post Donation' },
        { path: '/donations', label: 'My Donations' },
        { path: '/find-ngos', label: 'Find NGOs' }
      ];
    }

    if (hasRole('ngo')) {
      return [
        ...commonItems,
        { path: '/ngo-dashboard', label: 'Dashboard' },
        { path: '/donation-requests', label: 'Donation Requests' },
        { path: '/reports', label: 'Reports' }
      ];
    }

    if (hasRole('admin')) {
      return [
        ...commonItems,
        { path: '/admin-dashboard', label: 'Admin Dashboard' },
        { path: '/verify-ngos', label: 'Verify NGOs' },
        { path: '/manage-users', label: 'Manage Users' },
        { path: '/analytics', label: 'Analytics' }
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">NGOConnect</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveLink(item.path)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* User Menu */}
            {isAuthenticated && (
              <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-blue-500">
                {/* Chat Notifications */}
                <ChatNotifications onChatOpen={handleChatOpen} />
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.role === 'donor' ? 'bg-blue-100 text-blue-800' :
                    user?.role === 'ngo' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user?.role?.toUpperCase()}
                  </span>
                  <span className="text-sm">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveLink(item.path)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile User Menu */}
            {isAuthenticated && (
              <div className="border-t border-blue-500 pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                    user?.role === 'donor' ? 'bg-blue-100 text-blue-800' :
                    user?.role === 'ngo' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user?.role?.toUpperCase()}
                  </span>
                  <span className="text-sm text-blue-100">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;