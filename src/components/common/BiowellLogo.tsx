import React from 'react';

interface BiowellLogoProps {
  className?: string;
  color?: string;
}

const BiowellLogo: React.FC<BiowellLogoProps> = ({ 
  className = '', 
  color = '#3b82f6' // Default to primary blue
}) => {
  return (
    <div className={`flex items-center font-bold ${className}`}>
      <span style={{ color }}>BIO</span>
      {/* Three dashes replacing the W */}
      <div className="flex flex-col gap-[3px] mx-1">
        <div style={{ backgroundColor: color, height: '3px', width: '16px', borderRadius: '1px' }}></div>
        <div style={{ backgroundColor: color, height: '3px', width: '16px', borderRadius: '1px' }}></div>
        <div style={{ backgroundColor: color, height: '3px', width: '16px', borderRadius: '1px' }}></div>
      </div>
      <span style={{ color }}>ELL</span>
    </div>
  );
};

export default BiowellLogo;