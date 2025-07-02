import React from 'react';

interface EatwellLogoProps {
  className?: string;
  color?: string;
}

const EatwellLogo: React.FC<EatwellLogoProps> = ({ 
  className = '', 
  color = '#3b82f6' // Default to primary blue
}) => {
  return (
    <div className={`flex items-center font-bold ${className}`}>
      {/* Three dashes replacing the E */}
      <div className="flex flex-col gap-[3px] mr-1">
        <div style={{ backgroundColor: color, height: '3px', width: '16px', borderRadius: '1px' }}></div>
        <div style={{ backgroundColor: color, height: '3px', width: '16px', borderRadius: '1px' }}></div>
        <div style={{ backgroundColor: color, height: '3px', width: '16px', borderRadius: '1px' }}></div>
      </div>
      <span style={{ color }}>ATWELL</span>
    </div>
  );
};

export default EatwellLogo;