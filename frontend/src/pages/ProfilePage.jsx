import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileForm from '../components/auth/ProfileForm';

const ProfilePage = () => {
  const { user, updateProfile, loading, error } = useAuth();
  const [success, setSuccess] = useState(null);

  const handleUpdateProfile = async (profileData) => {
    setSuccess(null);
    const result = await updateProfile(profileData);
    if (result.success) {
      setSuccess('Profile updated successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Profile Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <ProfileForm
          user={user}
          onSubmit={handleUpdateProfile}
          loading={loading}
          error={error}
          success={success}
        />
      </div>
    </div>
  );
};

export default ProfilePage;