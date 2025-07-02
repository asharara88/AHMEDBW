import React from 'react';

interface MovewellLogoProps {
  className?: string;
  color?: string;
}

const MovewellLogo: React.FC<MovewellLogoProps> = ({ 
  className = '', 
  color = '#3b82f6' // Default to primary blue
}) => {
  return (
    <div className={`flex items-center font-bold ${className}`}>
      <span style={{ color }}>MOV</span>
      {/* Three dashes replacing the E */}
      <div className="flex flex-col gap-[3px] mx-1">
        <div style={{ backgroundColor: color, height: '3px', width: '16px', borderRadius: '1px' }}></div>
        <div style={{ backgroundColor: color, height: '3px', width: '16px', borderRadius: '1px' }}></div>
        <div style={{ backgroundColor: color, height: '3px', width: '16px', borderRadius: '1px' }}></div>
      </div>
      <span style={{ color }}>WELL</span>
    </div>
  );
};

export default MovewellLogo;