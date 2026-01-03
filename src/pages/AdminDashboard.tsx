import React from 'react';
import { Settings } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <Settings className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">This feature is not available in this version.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
