import React from 'react';

interface ProgressDotsProps {
  count: number;
  current: number;
  onDotClick: (index: number) => void;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({ count, current, onDotClick }) => {
  return (
    <div className="flex justify-center space-x-2">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            index === current ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};
