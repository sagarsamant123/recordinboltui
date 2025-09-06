import React, { useState, useCallback } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
  variant?: 'default' | 'mini';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  className = '',
  variant = 'default'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    setHoverTime(Math.max(0, Math.min(time, duration)));
  }, [duration]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    onSeek(Math.max(0, Math.min(time, duration)));
  }, [duration, onSeek]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isMini = variant === 'mini';

  return (
    <div className={`${className}`}>
      {!isMini && (
        <div className="flex justify-between text-sm lg:text-base text-gray-400 mb-2 lg:mb-3">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
      
      <div 
        className={`relative bg-gray-600 rounded-full cursor-pointer touch-none transition-all duration-200 ${
          isMini ? 'h-1.5' : isHovering ? 'h-2.5 lg:h-3' : 'h-1.5 lg:h-2'
        }`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
        onTouchStart={() => setIsHovering(true)}
        onTouchEnd={() => setIsHovering(false)}
      >
        {/* Progress fill */}
        <div 
          className="absolute left-0 top-0 h-full bg-[#B8FF4F] rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
        
        {/* Hover preview */}
        {!isMini && isHovering && duration > 0 && (
          <>
            <div 
              className="absolute top-0 h-full w-0.5 lg:w-1 bg-white opacity-50"
              style={{ left: `${(hoverTime / duration) * 100}%` }}
            />
            <div 
              className="absolute -top-8 lg:-top-10 bg-black text-white px-2 py-1 rounded text-xs lg:text-sm pointer-events-none transform -translate-x-1/2 shadow-lg"
              style={{ left: `${(hoverTime / duration) * 100}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          </>
        )}
        
        {/* Progress handle */}
        {!isMini && (
          <div 
            className={`absolute top-1/2 w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-full transform -translate-y-1/2 transition-all duration-150 shadow-lg ${
              isHovering || isDragging ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
            }`}
            style={{ left: `${progress}%`, marginLeft: window.innerWidth >= 1024 ? '-8px' : '-6px' }}
          />
        )}
      </div>
    </div>
  );
};