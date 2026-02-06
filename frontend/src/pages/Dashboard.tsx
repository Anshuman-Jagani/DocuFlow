import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">
            Dashboard content will be implemented in Day 2
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
