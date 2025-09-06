import React from 'react';
import { Lock, Clock, Eye } from 'lucide-react';

interface PreviewBannerProps {
  onLoginClick: () => void;
  className?: string;
}

export const PreviewBanner: React.FC<PreviewBannerProps> = ({ onLoginClick, className = '' }) => {
  return (
    <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6 ${className}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Eye className="w-5 h-5 text-yellow-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Preview Mode</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span>Audio limited to 10 seconds per recording</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span>Only 10 most recent messages shown</span>
            </div>
          </div>
          <button
            onClick={onLoginClick}
            className="mt-4 bg-[#212124] text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            Sign In for Full Access
          </button>
        </div>
      </div>
    </div>
  );
};