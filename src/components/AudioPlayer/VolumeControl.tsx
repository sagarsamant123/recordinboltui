import React, { useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  className = ''
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleSliderChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(x / rect.width, 1));
    onVolumeChange(newVolume);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div 
      className={`flex items-center gap-2 md:gap-3 lg:gap-4 ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        onClick={onToggleMute}
        className="p-1.5 md:p-2 lg:p-3 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
      </button>

      <div 
        className={`relative w-16 md:w-24 lg:w-32 xl:w-40 h-1.5 lg:h-2 bg-gray-600 rounded-full cursor-pointer touch-none transition-all duration-200 ${
          isHovering ? 'h-2.5 lg:h-3' : 'h-1.5 lg:h-2'
        }`}
        onClick={handleSliderChange}
        onTouchStart={() => setIsHovering(true)}
        onTouchEnd={() => setIsHovering(false)}
      >
        <div 
          className="absolute left-0 top-0 h-full bg-[#B8FF4F] rounded-full transition-all duration-150"
          style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
        />
        
        {/* Volume handle */}
        <div 
          className={`absolute top-1/2 w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-full transform -translate-y-1/2 transition-all duration-150 shadow-lg ${
            isHovering ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
          }`}
          style={{ left: `${(isMuted ? 0 : volume) * 100}%`, marginLeft: window.innerWidth >= 1024 ? '-8px' : '-6px' }}
        />
      </div>

      <span className="text-[10px] md:text-xs lg:text-sm text-gray-400 w-6 md:w-8 lg:w-10 text-right">
        {Math.round((isMuted ? 0 : volume) * 100)}
      </span>
    </div>
  );
};