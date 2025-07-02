import React from 'react';

interface RestWellLogoProps {
  className?: string;
}

const RestWellLogo: React.FC<RestWellLogoProps> = ({ 
  className = ''
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/1.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvcy8xLnN2ZyIsImlhdCI6MTc1MTQ1MjY0OCwiZXhwIjoxNzgyOTg4NjQ4fQ.2RGXKEycsFgYQvjx8xDFcrHAcA1aUUav2cSxWPCChlM" 
        alt="RESTWELL" 
        className="h-6 w-auto"
      />
    </div>
  );
};

export default RestWellLogo;