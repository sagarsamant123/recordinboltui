import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Mail, Lock } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { formatToIndianDateTime } from '../../utils/dateTime';

interface PreviewAudioPlayerProps {
  sid: string;
  title: string;
  className?: string;
  iconUrl?: string | null;
  createdTime: string;
  onLoginRequired: () => void;
  autoPlay?: boolean;
}

const PREVIEW_DURATION = 10; // 10 seconds preview limit

export const PreviewAudioPlayer: React.FC<PreviewAudioPlayerProps> = ({
  sid,
  title,
  iconUrl,
  createdTime,
  onLoginRequired,
  autoPlay = false,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  // Preview URL - replace with actual preview endpoint
  const previewUrl = `http://localhost:6600/api/preview/${sid}`;

  // Audio event handlers
  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      
      // Stop playback at preview limit
      if (time >= PREVIEW_DURATION) {
        audioRef.current.pause();
        setHasReachedLimit(true);
      }
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(Math.min(audioRef.current.duration, PREVIEW_DURATION));
      setIsLoading(false);
    }
  }, []);

  const handleError = useCallback(() => {
    setError('Failed to load audio preview');
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setHasReachedLimit(false);
  }, []);

  // Playback controls
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (hasReachedLimit) {
      onLoginRequired();
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
      setError('Playback failed');
    }
  }, [isPlaying, hasReachedLimit, onLoginRequired]);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current && duration > 0) {
      const seekTime = Math.max(0, Math.min(time, PREVIEW_DURATION));
      audioRef.current.currentTime = seekTime;
      if (seekTime < PREVIEW_DURATION) {
        setHasReachedLimit(false);
      }
    }
  }, [duration]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [autoPlay]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 hover:border-[#B8FF4F] transition-all duration-300 p-4 ${className}`}>
      <audio
        ref={audioRef}
        src={previewUrl}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onEnded={() => {
          setIsPlaying(false);
          setHasReachedLimit(true);
        }}
        preload="metadata"
      />

      {/* Preview Limitation Notice */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-yellow-800">
          <Lock className="w-4 h-4" />
          <span className="font-medium">Preview Mode:</span>
          <span>Limited to {PREVIEW_DURATION} seconds</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Play button */}
        <button
          onClick={togglePlayback}
          disabled={isLoading}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0 ${
            hasReachedLimit 
              ? 'bg-yellow-500 hover:bg-yellow-600' 
              : 'bg-[#B8FF4F] hover:bg-green-400'
          }`}
          aria-label={hasReachedLimit ? 'Sign in for full access' : (isPlaying ? 'Pause' : 'Play')}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
          ) : hasReachedLimit ? (
            <Lock className="w-6 h-6 text-white" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6 text-gray-800" />
          ) : (
            <Play className="w-6 h-6 text-gray-800 ml-0.5" />
          )}
        </button>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-bold text-gray-800 truncate leading-tight">{title}</h4>
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(PREVIEW_DURATION)}</span>
            {hasReachedLimit && (
              <span className="text-yellow-600 font-medium ml-2">• Preview ended</span>
            )}
          </div>
        </div>

        {/* Restricted actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={onLoginRequired}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Sign in to request deletion"
            title="Sign in to request deletion"
          >
            <Mail className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
          <button
            onClick={onLoginRequired}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Sign in to download"
            title="Sign in to download"
          >
            <Download className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <ProgressBar
          currentTime={currentTime}
          duration={PREVIEW_DURATION}
          onSeek={handleSeek}
          variant="mini"
        />
      </div>

      {/* Preview limit reached message */}
      {hasReachedLimit && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Lock className="w-4 h-4" />
              <span>Preview limit reached</span>
            </div>
            <button
              onClick={onLoginRequired}
              className="text-sm font-medium text-[#212124] hover:underline"
            >
              Sign in for full access
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
};