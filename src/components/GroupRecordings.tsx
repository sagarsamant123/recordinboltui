import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, Mail, Download } from 'lucide-react';
import { GroupData } from '../types/api';
import { AudioPlayer } from './AudioPlayer/AudioPlayer';
import { PreviewAudioPlayer } from './AudioPlayer/PreviewAudioPlayer';
import { formatToIndianDateTime, getDaysUntilDeletion } from '../utils/dateTime';
import { Clock, AlertTriangle } from 'lucide-react';
import { EmailRequestModal } from './EmailRequestModal';
import { DownloadProgressModal } from './DownloadProgressModal';
import { PreviewBanner } from './PreviewBanner';
import { useAuth } from '../hooks/useAuth';

interface GroupRecordingsProps {
  group: GroupData;
  onBack: () => void;
}

export const GroupRecordings: React.FC<GroupRecordingsProps> = ({ group, onBack }) => {
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalRecording, setEmailModalRecording] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string>('');
  const recordingsRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Scroll to recordings list with a smooth animation
    if (recordingsRef.current) {
      recordingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Debug effect for download state
  useEffect(() => {
    if (isDownloading) {
      console.log('Download modal state:', { isDownloading, downloadProgress, downloadingFile });
    }
  }, [isDownloading, downloadProgress, downloadingFile]);

  const handleNext = () => {
    if (currentIndex < group.sid_info.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedRecording(group.sid_info[nextIndex].sid);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedRecording(group.sid_info[prevIndex].sid);
    }
  };

  const handleRecordingSelect = (sid: string) => {
    const index = group.sid_info.findIndex(r => r.sid === sid);
    setCurrentIndex(index);
    setSelectedRecording(sid);
  };

  const handleEmailRequest = (recording: any) => {
    setEmailModalRecording(recording);
    setShowEmailModal(true);
  };

  const handleDownload = async (recording: any) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    try {
      const fileName = `${group.title}_${formatToIndianDateTime(recording.createdT).replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      console.log('Starting download:', fileName);
      setDownloadingFile(fileName);
      setIsDownloading(true);
      setDownloadProgress(0);

      const response = await fetch(`https://81bz28hd-6600.inc1.devtunnels.ms/api/stream/${recording.sid}?format=mp3`);
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
        console.log('Download progress:', progress, '%');
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
  };

  const handleLoginRequired = () => {
    window.location.href = '/login';
  };

  // Show preview mode for unauthenticated users
  if (!isAuthenticated) {
    const previewRecordings = group.sid_info
      .sort((a, b) => new Date(b.createdT).getTime() - new Date(a.createdT).getTime())
      .slice(0, 10);

    return (
      <div className="space-y-4 sm:space-y-6 pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 sticky top-0 bg-gray-50 z-10 py-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#212124] flex items-center space-x-2 sm:space-x-3">
                {group.iconUrl && (
                  <img 
                    src={group.iconUrl} 
                    alt={group.title}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
                  />
                )}
                <span className="truncate max-w-[200px] sm:max-w-none">{group.title}</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Showing {previewRecordings.length} of {group.sid_info.length} recordings (Preview Mode)
              </p>
            </div>
          </div>
        </div>

        {/* Preview Banner */}
        <PreviewBanner onLoginClick={handleLoginRequired} className="mx-4 sm:mx-0" />

        {/* Preview Recordings */}
        <div ref={recordingsRef} className="space-y-4 px-4 sm:px-0">
          {previewRecordings.map((recording) => (
            <div 
              key={recording.sid}
              className={`bg-white rounded-lg border-2 transition-all duration-300 ${
                selectedRecording === recording.sid 
                  ? 'border-[#B8FF4F] shadow-lg' 
                  : 'border-gray-200 hover:border-[#B8FF4F] hover:shadow-md'
              } hover:shadow-xl transition-all duration-300 group cursor-pointer mb-safe`}
            >
              {selectedRecording === recording.sid ? (
                <PreviewAudioPlayer
                  sid={recording.sid}
                  title={`${group.title} - ${formatToIndianDateTime(recording.createdT)}`}
                  iconUrl={group.iconUrl}
                  createdTime={recording.createdT}
                  onLoginRequired={handleLoginRequired}
                />
              ) : (
                <div className="p-3 sm:p-4 relative">
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    <span>Preview</span>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleRecordingSelect(recording.sid)}
                    >
                      <h4 className="font-bold text-[#212124] text-sm sm:text-base truncate pr-2">
                        {formatToIndianDateTime(recording.createdT)}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500">Click to play preview (10s)</p>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoginRequired();
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Sign in to request deletion"
                      >
                        <Mail className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoginRequired();
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Sign in to download"
                      >
                        <Download className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </button>
                      
                      <button
                        onClick={() => handleRecordingSelect(recording.sid)}
                        className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-600 transition-colors"
                      >
                        <Play className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Bottom CTA for Full Access */}
        <div className="mx-4 sm:mx-0 mt-8 p-6 bg-gradient-to-r from-[#212124] to-gray-800 rounded-2xl text-white text-center">
          <h3 className="text-xl font-bold mb-4">Want Full Access?</h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Get unlimited playback, download capabilities, and access to all recordings.
          </p>
          <button
            onClick={handleLoginRequired}
            className="bg-[#B8FF4F] text-[#212124] px-8 py-3 rounded-lg font-bold hover:bg-[#A3E844] transition-colors"
          >
            Sign In or Request Access
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4 sm:space-y-6 pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 sticky top-0 bg-gray-50 z-10 py-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#212124] flex items-center space-x-2 sm:space-x-3">
              {group.iconUrl && (
                <img 
                  src={group.iconUrl} 
                  alt={group.title}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
                />
              )}
              <span className="truncate max-w-[200px] sm:max-w-none">{group.title}</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {group.sid_info.length} {group.sid_info.length === 1 ? 'recording' : 'recordings'}
            </p>
          </div>
        </div>
      </div>

      {/* Recordings List */}
      <div ref={recordingsRef} className="space-y-4 px-4 sm:px-0">
        {group.sid_info
          .sort((a, b) => new Date(b.createdT).getTime() - new Date(a.createdT).getTime())
          .map((recording) => (
          <div 
            key={recording.sid}
            className={`bg-white rounded-lg border-2 transition-all duration-300 ${
              selectedRecording === recording.sid 
                ? 'border-[#B8FF4F] shadow-lg' 
                : 'border-gray-200 hover:border-[#B8FF4F] hover:shadow-md'
            } hover:shadow-xl transition-all duration-300 group cursor-pointer mb-safe`}
          >
            {selectedRecording === recording.sid ? (
              <AudioPlayer
                sid={recording.sid}
                title={`${group.title} - ${formatToIndianDateTime(recording.createdT)}`}
                iconUrl={group.iconUrl}
                createdTime={recording.createdT}
                onNext={currentIndex < group.sid_info.length - 1 ? handleNext : undefined}
                onPrevious={currentIndex > 0 ? handlePrevious : undefined}
              />
            ) : (
              <div className="p-3 sm:p-4 relative">
                {/* Notification Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 sm:gap-2 bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Auto-deletes in {getDaysUntilDeletion(recording.createdT)} days</span>
                  <span className="sm:hidden">{getDaysUntilDeletion(recording.createdT)}d</span>
                </div>

                <div className="flex items-center justify-between mt-4 sm:mt-6">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleRecordingSelect(recording.sid)}
                  >
                    <h4 className="font-bold text-[#212124] text-sm sm:text-base truncate pr-2">
                      {formatToIndianDateTime(recording.createdT)}
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <p className="text-xs sm:text-sm text-gray-500">Click to play</p>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{getDaysUntilDeletion(recording.createdT)} days left</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {/* Email Request Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmailRequest(recording);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Email deletion request"
                      title="Request deletion via email"
                    >
                      <Mail className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                    
                    {/* Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(recording);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Download recording"
                      title="Download recording"
                    >
                      <Download className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                    </button>
                    
                    {/* Play Button */}
                    <button
                      onClick={() => handleRecordingSelect(recording.sid)}
                      className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-[#B8FF4F] flex items-center justify-center hover:bg-green-400 transition-colors"
                      aria-label="Play recording"
                    >
                      <Play className="w-5 h-5 sm:w-4 sm:h-4 text-[#212124]" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Email Modal */}
      {showEmailModal && emailModalRecording && (
        <EmailRequestModal
          sid={emailModalRecording.sid}
          title={`${group.title} - ${formatToIndianDateTime(emailModalRecording.createdT)}`}
          createdTime={formatToIndianDateTime(emailModalRecording.createdT)}
          onClose={() => {
            setShowEmailModal(false);
            setEmailModalRecording(null);
          }}
        />
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
    </div>
  );
};