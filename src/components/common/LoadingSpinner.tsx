import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  label?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'primary',
  className = '',
  label = 'Loading...'
}: LoadingSpinnerProps) {
  // Map size to actual dimensions
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };
  
  // Map color to actual styles
  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-300 border-t-transparent dark:border-gray-600'
  };
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`} role="status">
      <motion.div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          ease: 'linear' 
        }}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}