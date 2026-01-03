import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';

const PublicProfile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold mb-4">User Profile</h1>
          <p className="text-gray-600 text-lg">This feature is not available in this version.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
