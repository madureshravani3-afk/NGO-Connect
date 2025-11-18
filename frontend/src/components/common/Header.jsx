import React from 'react';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">NGOConnect</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="hover:text-blue-200 transition-colors">Home</a>
            <a href="/donate" className="hover:text-blue-200 transition-colors">Donate</a>
            <a href="/ngos" className="hover:text-blue-200 transition-colors">Find NGOs</a>
            <a href="/login" className="hover:text-blue-200 transition-colors">Login</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;