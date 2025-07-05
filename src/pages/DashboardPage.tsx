import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        BioWell Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Health Overview</h2>
          <p className="text-gray-600">Welcome to your health dashboard!</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>
          <p className="text-gray-600">Track your daily health metrics.</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <p className="text-gray-600">Personalized health recommendations.</p>
        </div>
      </div>
    </div>
  );
};
