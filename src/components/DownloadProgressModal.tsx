import React from 'react';
import { X } from 'lucide-react';
import { Portal } from './Portal';

interface DownloadProgressModalProps {
  progress: number;
  fileName: string;
  onClose: () => void;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  progress,
  fileName,
  onClose,
}) => {
  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Downloading...</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 truncate">
            {fileName}
          </p>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-green-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-right text-sm text-gray-600">
            {progress}%
          </div>
        </div>
      </div>
    </Portal>
  );
};
