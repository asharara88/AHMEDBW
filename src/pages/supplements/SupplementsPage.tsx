import React from 'react';

const SupplementsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Supplements</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Supplement Recommendations</h2>
          <p className="text-gray-600">
            Discover personalized supplement recommendations based on your health goals and data.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Custom Stacks</h2>
          <p className="text-gray-600">
            Build custom supplement stacks tailored to your specific needs and preferences.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Track Progress</h2>
          <p className="text-gray-600">
            Monitor the effectiveness of your supplements and adjust as needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupplementsPage;