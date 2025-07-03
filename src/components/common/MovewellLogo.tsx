import React from 'react';

interface MovewellLogoProps {
  className?: string;
}

const MovewellLogo: React.FC<MovewellLogoProps> = ({ 
  className = ''
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/2.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvcy8yLnN2ZyIsImlhdCI6MTc1MTQ1MjcwMCwiZXhwIjoxNzgyOTg4NzAwfQ.ToGkjAJv89sLydmj8qQwVXYrKjvnPEU_zGWhAmVo1yE" 
        alt="MOVEWELL" 
        className="h-24 w-auto" // Increased from h-6 to h-24 (4x size)
      />
    </div>
  );
};

export default MovewellLogo;