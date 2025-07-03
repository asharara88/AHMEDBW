import React from 'react';

interface EatwellLogoProps {
  className?: string;
}

const EatwellLogo: React.FC<EatwellLogoProps> = ({ 
  className = ''
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/3.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvcy8zLnN2ZyIsImlhdCI6MTc1MTQ1MjY3OSwiZXhwIjoxNzgyOTg4Njc5fQ.ooTqlo57-N42aRcfvvbvC9bE9C3mKp4rdWwC2u5ZzMo" 
        alt="EATWELL" 
        className="h-24 w-auto" // Increased from h-6 to h-24 (4x size)
      />
    </div>
  );
};

export default EatwellLogo;