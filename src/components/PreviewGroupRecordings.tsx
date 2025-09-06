import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Lock, Eye, Users, Play, Mail, Download } from 'lucide-react';
import { GroupData } from '../types/api';
import { PreviewAudioPlayer } from './AudioPlayer/PreviewAudioPlayer';
import { formatToIndianDateTime } from '../utils/dateTime';
import { PreviewBanner } from './PreviewBanner';

interface PreviewGroupRecordingsProps {
  group: GroupData;
  onBack: () => void;
  onLoginRequired: () => void;
}

const PREVIEW_MESSAGE_LIMIT = 10;

export const PreviewGroupRecordings: React.FC<PreviewGroupRecordingsProps> = ({ 
  group, 
  onBack, 
  onLoginRequired 
}) => {
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const recordingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recordingsRef.current) {
      recordingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleRecordingSelect = (sid: string) => {
    setSelectedRecording(sid);
  };

  // Get only the most recent recordings for preview
  const previewRecordings = group.sid_info
    .sort((a, b) => new Date(b.createdT).getTime() - new Date(a.createdT).getTime())
    .slice(0, PREVIEW_MESSAGE_LIMIT);

  const hiddenRecordingsCount = group.sid_info.length - previewRecordings.length;

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
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <Eye className="w-3 h-3 text-yellow-600" />
              </div>
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Showing {previewRecordings.length} of {group.sid_info.length} recordings (Preview Mode)
            </p>
          </div>
        </div>
      </div>

      {/* Preview Banner */}
      <PreviewBanner onLoginClick={onLoginRequired} className="mx-4 sm:mx-0" />

      {/* Hidden Content Notice */}
      {hiddenRecordingsCount > 0 && (
        <div className="mx-4 sm:mx-0 p-4 bg-gray-100 border-2 border-gray-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                {hiddenRecordingsCount} Additional Recordings
              </h3>
              <p className="text-sm text-gray-600">
                Sign in to access all recordings from this group
              </p>
            </div>
            <button
              onClick={onLoginRequired}
              className="ml-auto bg-[#212124] text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Preview Recordings List */}
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
                onLoginRequired={onLoginRequired}
              />
            ) : (
              <div className="p-3 sm:p-4 relative">
                {/* Preview Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  <Eye className="w-3 h-3" />
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <p className="text-xs sm:text-sm text-gray-500">Click to play preview (10s)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {/* Restricted Email Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoginRequired();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Sign in to request deletion"
                      title="Sign in to request deletion"
                    >
                      <Mail className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </button>
                    
                    {/* Restricted Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoginRequired();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors group min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Sign in to download"
                      title="Sign in to download"
                    >
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </button>
                    
                    {/* Play Button */}
                    <button
                      onClick={() => handleRecordingSelect(recording.sid)}
                      className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-600 transition-colors"
                      aria-label="Play preview"
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
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="w-6 h-6 text-[#B8FF4F]" />
          <h3 className="text-xl font-bold">Want Full Access?</h3>
        </div>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Get unlimited playback, download capabilities, and access to all recordings in this group.
        </p>
        <button
          onClick={onLoginRequired}
          className="bg-[#B8FF4F] text-[#212124] px-8 py-3 rounded-lg font-bold hover:bg-[#A3E844] transition-colors"
        >
          Sign In or Request Access
        </button>
      </div>
    </div>
  );
};