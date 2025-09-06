import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Download, SkipBack, SkipForward, Trash2, Mail } from 'lucide-react';
import { getStreamUrl } from '../../utils/api';
import { AudioWaveform } from './AudioWaveform';
import { AudioControls } from './AudioControls';
import { VolumeControl } from './VolumeControl';
import { ProgressBar } from './ProgressBar';
import { Portal } from '../Portal';
import { EmailRequestModal } from '../EmailRequestModal';
import { DownloadProgressModal } from '../DownloadProgressModal';
import { formatToIndianDateTime } from '../../utils/dateTime';
import { useAuth } from '../../hooks/useAuth';


interface AudioPlayerProps {
  sid: string;
  title: string;
  className?: string;
  iconUrl?: string | null;
  createdTime: string;
  onNext?: () => void;
  onPrevious?: () => void;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  sid,
  title,
  iconUrl,
  createdTime,
  onNext,
  onPrevious,
  autoPlay = false,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string>('');
  const { isAuthenticated } = useAuth();

  // Audio event handlers
  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleError = useCallback((e: any) => {
    console.error('Audio error:', e);
    // Check if it's an authentication error
    if (e.target?.error?.code === 4 || e.target?.networkState === 3) {
      setError('Authentication required. Please log in again.');
      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      setError('Failed to load audio');
    }
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  // Playback controls
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Check authentication before playing
    if (!isAuthenticated) {
      window.location.href = '/login';
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
  }, [isPlaying, isAuthenticated]);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
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

  const handleDownload = useCallback(async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      setDownloadingFile(fileName);
      setIsDownloading(true);
      setDownloadProgress(0);

      const response = await fetch(`${getStreamUrl(sid)}?format=mp3`);
      const reader = response.body?.getReader();
      const contentLength = Number(response.headers.get('Content-Length')) || 0;
      
      if (!reader) {
        throw new Error('Failed to start download');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;
        const progress = Math.round((receivedLength / contentLength) * 100);
        setDownloadProgress(progress);
      }

      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadingFile('');
    }
  }, [sid, title, isAuthenticated]);

  const handleEmailRequest = useCallback(() => {
    setShowEmailModal(true);
  }, []);

  // Load audio buffer for waveform visualization
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAudioBuffer = async () => {
      try {
        const response = await fetch(getStreamUrl(sid));
        
        if (response.status === 401) {
          setError('Authentication required. Please log in again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        setAudioBuffer(buffer);
      } catch (error) {
        console.error('Failed to load audio buffer:', error);
      }
    };

    loadAudioBuffer();
  }, [sid, isAuthenticated]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && audioRef.current && isAuthenticated) {
      audioRef.current.play().catch(console.error);
    }
  }, [autoPlay, isAuthenticated]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isMaximized) {
        switch (e.code) {
          case 'Space':
            e.preventDefault();
            togglePlayback();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            handleSeek(currentTime - 10);
            break;
          case 'ArrowRight':
            e.preventDefault();
            handleSeek(currentTime + 10);
            break;
          case 'ArrowUp':
            e.preventDefault();
            handleVolumeChange(Math.min(1, volume + 0.1));
            break;
          case 'ArrowDown':
            e.preventDefault();
            handleVolumeChange(Math.max(0, volume - 0.1));
            break;
          case 'KeyM':
            e.preventDefault();
            toggleMute();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMaximized, togglePlayback, currentTime, handleSeek, volume, handleVolumeChange, toggleMute]);

  // Prevent body scroll when maximized
  useEffect(() => {
    if (isMaximized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMaximized]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show authentication error if not logged in
  if (!isAuthenticated) {
    return (
      <div className={`bg-white rounded-xl border-2 border-gray-200 p-4 ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please log in to access full recordings</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-[#212124] text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  const playerContent = isMaximized ? (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800 min-h-[60px]">
        <h1 className="text-base sm:text-lg md:text-xl font-bold truncate max-w-[70%] leading-tight">{title}</h1>
        <button
          onClick={() => setIsMaximized(false)}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Minimize player"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto min-h-0 w-full">
        {/* Album art */}
        <div className="w-full max-w-[200px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[400px] xl:max-w-[480px] aspect-square mb-4 sm:mb-6 md:mb-8 rounded-2xl overflow-hidden shadow-2xl mx-auto">
          {iconUrl ? (
            <img 
              src={iconUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#B8FF4F] to-green-400 flex items-center justify-center">
              <Volume2 className="w-12 h-12 sm:w-16 sm:h-16 md:w-32 md:h-32 lg:w-40 lg:h-40 text-gray-800" />
            </div>
          )}
        </div>

        {/* Track info */}
        <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 text-center px-4 leading-tight max-w-4xl">{title}</h2>
        <p className="text-sm md:text-base lg:text-lg text-gray-400 mb-4 sm:mb-6 md:mb-8">{new Date(createdTime).toLocaleDateString()}</p>

        {/* Waveform */}
        {audioBuffer && (
          <div className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl px-4 sm:px-6 lg:px-8 mx-auto">
            <AudioWaveform
              audioBuffer={audioBuffer}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              className="mb-4 sm:mb-6 md:mb-8"
              height={window.innerWidth >= 1536 ? 120 : window.innerWidth >= 1280 ? 100 : window.innerWidth >= 1024 ? 80 : window.innerWidth >= 768 ? 60 : 50}
            />
          </div>
        )}

      
      {showEmailModal && (
        <EmailRequestModal
          sid={sid}
          title={title}
          createdTime={formatToIndianDateTime(createdTime)}
          onClose={() => setShowEmailModal(false)}
        />
      )}
        {/* Progress bar */}
        <div className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl px-4 sm:px-6 lg:px-8 mx-auto">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            className="mb-4 sm:mb-6 md:mb-8"
          />
        </div>

        {/* Controls */}
        <div className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl px-4 sm:px-6 lg:px-8 mx-auto">
          <AudioControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            onTogglePlay={togglePlayback}
            onPrevious={onPrevious}
            onNext={onNext}
            onDownload={handleDownload}
            onEmailRequest={handleEmailRequest}
            className="mb-4 sm:mb-6 md:mb-8"
          />
        </div>

        {/* Volume control */}
        <div className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl flex justify-center px-4 sm:px-6 lg:px-8 pb-4 sm:pb-0 mx-auto">
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={toggleMute}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className={`bg-white rounded-xl border-2 border-gray-200 hover:border-[#B8FF4F] transition-all duration-300 p-4 ${className}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Play button */}
        <button
          onClick={togglePlayback}
          disabled={isLoading}
          className="w-12 h-12 bg-[#B8FF4F] rounded-full flex items-center justify-center hover:bg-green-400 transition-colors disabled:opacity-50 flex-shrink-0"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
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
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mini controls */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={handleEmailRequest}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Email deletion request"
            title="Request deletion via email"
          >
            <Mail className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Download"
            title="Download recording"
          >
            <Download className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
          </button>
          <button
            onClick={() => setIsMaximized(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Maximize player"
            title="Maximize player"
          >
            <Maximize2 className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mt-3">
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          variant="mini"
        />
      </div>
    </div>
  );

  return (
    <>
      <audio
        ref={audioRef}
        src={getStreamUrl(sid)}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onEnded={() => {
          setIsPlaying(false);
          if (onNext) onNext();
        }}
        preload="metadata"
      />
      
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}

      {isMaximized ? (
        <Portal>
          <div className="fixed inset-0 z-[9999]">
            {playerContent}
          </div>
        </Portal>
      ) : (
        playerContent
      )}

      {/* Download Progress Modal */}
      {isDownloading && (
        <DownloadProgressModal
          progress={downloadProgress}
          fileName={downloadingFile}
          onClose={() => {
            setIsDownloading(false);
            setDownloadProgress(0);
            setDownloadingFile('');
          }}
        />
      )}
    </>
  );
};