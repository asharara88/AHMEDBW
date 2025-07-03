import React from 'react';

interface MovewellLogoProps {
  className?: string;
}

const MovewellLogo: React.FC<MovewellLogoProps> = ({ 
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-3xl font-bold text-green-600">MOVEWELL</div>
      <span className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">Fitness</span>
    </div>
  );
};

export default MovewellLogo;