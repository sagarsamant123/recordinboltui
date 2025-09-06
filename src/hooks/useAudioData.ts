import { useState, useEffect, useCallback } from 'react';
import { OutputInfoResponse, GroupData } from '../types/api';
import { fetchWithCache } from '../utils/api';
import { authApi } from '../services/authApi';

interface UseAudioDataReturn {
  groups: GroupData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalRecordings: number;
}

/**
 * Enhanced hook for fetching and managing audio data with caching and error recovery
 */
export const useAudioData = (): UseAudioDataReturn => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudioData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithCache('output-info');
      const data: OutputInfoResponse = await response.json();

      if (data.success && data.data) {
        // Sort groups by most recent recording
        const groupsArray = Object.values(data.data).sort((a, b) => {
          const aLatest = Math.max(...a.sid_info.map(s => new Date(s.createdT).getTime()));
          const bLatest = Math.max(...b.sid_info.map(s => new Date(s.createdT).getTime()));
          return bLatest - aLatest;
        });
        
        setGroups(groupsArray);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Handle authentication errors specifically
      if (errorMessage.includes('Authentication expired')) {
        errorMessage = 'Your session has expired. Please log in again to access recordings.';
        // Redirect to login page
        window.location.href = '/login';
      }
      
      setError(`Failed to load audio data: ${errorMessage}`);
      console.error('Error fetching audio data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchAudioData();
  }, [fetchAudioData]);

  useEffect(() => {
    fetchAudioData();
  }, [fetchAudioData]);

  const totalRecordings = groups.reduce((sum, group) => sum + group.sid_info.length, 0);

  return { 
    groups, 
    loading, 
    error, 
    refetch,
    totalRecordings
  };
};