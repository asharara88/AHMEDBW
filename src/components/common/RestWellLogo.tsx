import React from 'react';

interface RestWellLogoProps {
  className?: string;
}

const RestWellLogo: React.FC<RestWellLogoProps> = ({ 
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-3xl font-bold text-indigo-600">RESTWELL</div>
      <span className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">Sleep and Recovery</span>
    </div>
  );
};

export default RestWellLogo;