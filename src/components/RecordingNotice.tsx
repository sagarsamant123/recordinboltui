import React, { useEffect, useState } from 'react';
import { Portal } from './Portal';

export const RecordingNotice: React.FC = () => {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Check if user has seen the notice before
    const hasSeenNotice = localStorage.getItem('hasSeenRecordingNotice');
    if (!hasSeenNotice) {
      setShowNotice(true);
    }
  }, []);

  const handleOkay = () => {
    // Save to localStorage so it won't show again
    localStorage.setItem('hasSeenRecordingNotice', 'true');
    setShowNotice(false);
  };

  if (!showNotice) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Important Notice</h2>
          <div className="space-y-4 mb-6">
            <p>
              Every chat is being recorded, but some chats and all screening chats are not publicly available.
            </p>
            <p>
              We are actively recording chat messages from most of the Indian anime community that we consider worth preserving.
            </p>
            <p>
              If you would like to request deletion of a particular recording, you can send us an email with the recording details.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleOkay}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Okay, I understand
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
