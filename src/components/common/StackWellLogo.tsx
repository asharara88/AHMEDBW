import React from 'react';

interface StackWellLogoProps {
  className?: string;
}

const StackWellLogo: React.FC<StackWellLogoProps> = ({ 
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-3xl font-bold text-primary">STACKWELL</div>
      <span className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">Supplements</span>
    </div>
  );
};

export default StackWellLogo;