import React, { useState } from 'react';
import { fetchWithCache } from '../utils/api';
import { Trash2, SkipForward, Check, X, Lock } from 'lucide-react';

const deleteRecording = async (sid: string, password: string): Promise<boolean> => {
  try {
    const response = await fetchWithCache(`delete-recording`, {
      method: 'POST',
      body: JSON.stringify({ sid, password }),
    }, false);
    return response.ok;
  } catch (error) {
    console.error('Delete recording error:', error);
    return false;
  }
};

const skipThread = async (threadId: string, skip: boolean, password: string): Promise<boolean> => {
  try {
    const response = await fetchWithCache(`skip-thread`, {
      method: 'POST',
      body: JSON.stringify({ threadId, skip, password }),
    }, false);
    return response.ok;
  } catch (error) {
    console.error('Skip thread error:', error);
    return false;
  }
};

export const AdminPanel: React.FC = () => {
  const [password, setPassword] = useState('');
  const [sid, setSid] = useState('');
  const [threadId, setThreadId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDeleteRecording = async () => {
    if (!password || !sid) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteRecording(sid, password);
      if (result) {
        setSuccess(`Successfully deleted recording: ${sid}`);
        setSid('');
      } else {
        setError('Failed to delete recording');
      }
    } catch (err) {
      setError('Error deleting recording');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipThread = async (skip: boolean) => {
    if (!password || !threadId) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await skipThread(threadId, skip, password);
      if (result) {
        setSuccess(`Successfully ${skip ? 'skipped' : 'unskipped'} thread: ${threadId}`);
        setThreadId('');
      } else {
        setError(`Failed to ${skip ? 'skip' : 'unskip'} thread`);
      }
    } catch (err) {
      setError(`Error ${skip ? 'skipping' : 'unskipping'} thread`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter admin password"
          />
        </div>

        {/* Delete Recording Section */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete Recording
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recording SID
              </label>
              <input
                type="text"
                value={sid}
                onChange={(e) => setSid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter recording SID"
              />
            </div>
            <button
              onClick={handleDeleteRecording}
              disabled={loading}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Deleting...' : 'Delete Recording'}
            </button>
          </div>
        </div>

        {/* Skip Thread Section */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SkipForward className="w-5 h-5 text-blue-500" />
            Skip/Unskip Thread
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thread ID
              </label>
              <input
                type="text"
                value={threadId}
                onChange={(e) => setThreadId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter thread ID"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSkipThread(true)}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                {loading ? 'Skipping...' : 'Skip Thread'}
              </button>
              <button
                onClick={() => handleSkipThread(false)}
                disabled={loading}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {loading ? 'Unskipping...' : 'Unskip Thread'}
              </button>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md flex items-center gap-2">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

