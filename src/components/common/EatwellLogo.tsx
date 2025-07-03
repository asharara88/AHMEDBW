import React from 'react';

interface EatwellLogoProps {
  className?: string;
}

const EatwellLogo: React.FC<EatwellLogoProps> = ({ 
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-3xl font-bold text-blue-600">EATWELL</div>
      <span className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">Nutrition</span>
    </div>
  );
};

export default EatwellLogo;