import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Download, Shuffle, Repeat, Mail } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  onTogglePlay: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onDownload: () => void;
  onEmailRequest?: () => void;
  className?: string;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  isLoading,
  onTogglePlay,
  onPrevious,
  onNext,
  onDownload,
  onEmailRequest,
  className = ''
}) => {
  return (
    <div className={`flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 px-2 ${className}`}>
      {/* Main Controls Group */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 w-full lg:w-auto">
        {/* Previous */}
        <button
          onClick={onPrevious}
          disabled={!onPrevious}
          className="p-3 lg:p-4 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] lg:min-w-[52px] lg:min-h-[52px] flex items-center justify-center"
          aria-label="Previous track"
        >
          <SkipBack className="w-6 h-6 lg:w-7 lg:h-7" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          disabled={isLoading}
          className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-[#B8FF4F] rounded-full flex items-center justify-center hover:bg-green-400 transition-colors disabled:opacity-50 shadow-lg"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 border-2 lg:border-3 border-gray-800 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-8 h-8 sm:w-9 sm:h-9 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-gray-800" />
          ) : (
            <Play className="w-8 h-8 sm:w-9 sm:h-9 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-gray-800 ml-1" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={!onNext}
          className="p-3 lg:p-4 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] lg:min-w-[52px] lg:min-h-[52px] flex items-center justify-center"
          aria-label="Next track"
        >
          <SkipForward className="w-6 h-6 lg:w-7 lg:h-7" />
        </button>
      </div>

      {/* Secondary Controls Group */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 w-full lg:w-auto">
        {/* Shuffle */}
        <button
          className="p-2 lg:p-3 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800 min-w-[44px] min-h-[44px] lg:min-w-[52px] lg:min-h-[52px] flex items-center justify-center"
          aria-label="Shuffle"
          disabled
        >
          <Shuffle className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        {/* Repeat */}
        <button
          className="p-2 lg:p-3 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800 min-w-[44px] min-h-[44px] lg:min-w-[52px] lg:min-h-[52px] flex items-center justify-center"
          aria-label="Repeat"
          disabled
        >
          <Repeat className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Email Request */}
          {onEmailRequest && (
            <button
              onClick={onEmailRequest}
              className="p-2 lg:p-3 text-gray-400 hover:text-blue-400 transition-colors rounded-full hover:bg-gray-800 min-w-[44px] min-h-[44px] lg:min-w-[52px] lg:min-h-[52px] flex items-center justify-center"
              aria-label="Email deletion request"
              title="Request deletion via email"
            >
              <Mail className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          )}
          
          {/* Download */}
          <button
            onClick={onDownload}
            className="p-2 lg:p-3 text-gray-400 hover:text-green-400 transition-colors rounded-full hover:bg-gray-800 min-w-[44px] min-h-[44px] lg:min-w-[52px] lg:min-h-[52px] flex items-center justify-center"
            aria-label="Download"
            title="Download recording"
          >
            <Download className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};