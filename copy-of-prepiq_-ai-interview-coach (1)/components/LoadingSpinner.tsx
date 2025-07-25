
import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-5 w-5',
        md: 'h-8 w-8',
        lg: 'h-16 w-16',
    };
    
    return (
        <div 
            className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-primary border-t-transparent`}
            role="status"
            aria-live="polite"
        >
          <span className="sr-only">Loading...</span>
        </div>
    );
};

export default LoadingSpinner;
