import React from 'react';

interface StackWellLogoProps {
  className?: string;
}

const StackWellLogo: React.FC<StackWellLogoProps> = ({ 
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjE4NjgsImV4cCI6MTc4MTc1Nzg2OH0.k7wGfiV-4klxCyuBpz_MhVhF0ahuZZqNI-LQh8rLLJA" 
        alt="STACKWELL" 
        className="h-24 w-auto"
      />
      <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">Supplements</span>
    </div>
  );
};

export default StackWellLogo;