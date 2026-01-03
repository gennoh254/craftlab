import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="space-y-4 mb-8">
              <div>
                <h2 className="text-gray-600 font-semibold">Name</h2>
                <p className="text-lg">{user?.name}</p>
              </div>
              <div>
                <h2 className="text-gray-600 font-semibold">Email</h2>
                <p className="text-lg">{user?.email}</p>
              </div>
              <div>
                <h2 className="text-gray-600 font-semibold">User Type</h2>
                <p className="text-lg capitalize">{user?.userType}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
