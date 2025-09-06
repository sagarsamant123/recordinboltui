import { authApi } from '../services/authApi';

const API_BASE_URL = 'https://v1hwz15p-6700.inc1.devtunnels.ms/api';

// Cache for API responses to improve performance
const apiCache = new Map<string, { data: any; timestamp: number }>();
const activeRequests = new Map<string, Promise<Response>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Enhanced fetch wrapper with authentication, caching, retry logic, and better error handling
 */
export const fetchWithCache = async (
  endpoint: string, 
  options: RequestInit = {},
  useCache = true
): Promise<Response> => {
  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;
  const cacheKey = `${url}_${JSON.stringify(options)}`;

  // Check cache first
  if (useCache && apiCache.has(cacheKey)) {
    const cached = apiCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached data for:', endpoint);
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    apiCache.delete(cacheKey);
  }

  // Check if there's already an active request for this endpoint
  if (activeRequests.has(cacheKey)) {
    console.log('Using existing request for:', endpoint);
    return activeRequests.get(cacheKey)!;
  }
  // Get authentication token and add to headers
  const token = authApi.getStoredToken();
  const authHeaders: HeadersInit = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const defaultOptions: RequestInit = {
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  let lastError: Error;
  const maxRetries = 3;

  // Create the request promise
  const requestPromise = (async () => {
    try {
      // Retry logic for failed requests
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, defaultOptions);
          
          // Handle authentication errors
          if (response.status === 401) {
            // Token expired or invalid, clear storage and throw specific error
            authApi.logout();
            throw new Error('Authentication expired. Please log in again.');
          }
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Cache successful responses
          if (useCache && response.ok) {
            const data = await response.clone().json();
            apiCache.set(cacheKey, { data, timestamp: Date.now() });
          }

          return response;
        } catch (error) {
          lastError = error as Error;
          
          // Don't retry authentication errors
          if (lastError.message.includes('Authentication expired')) {
            throw lastError;
          }
          
          if (attempt < maxRetries) {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      throw new Error(`Failed to fetch after ${maxRetries} attempts: ${lastError.message}`);
    } finally {
      // Clean up the active request
      activeRequests.delete(cacheKey);
    }
  })();

  // Store the active request
  activeRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
};

/**
 * Get streaming URL for audio file
 */
export const getStreamUrl = (sid: string): string => {
  const token = authApi.getStoredToken();
  const baseUrl = `${API_BASE_URL}/stream/${sid}`;
  
  // Add token as query parameter for audio streaming
  if (token) {
    return `${baseUrl}?token=${encodeURIComponent(token)}`;
  }
  
  return baseUrl;
};

/**
 * Get preview URL for audio file (10 second preview)
 */
export const getPreviewUrl = (sid: string): string => {
  return `${API_BASE_URL}/preview/${sid}`;
};

/**
 * Clear API cache (useful for forced refresh)
 */
export const clearApiCache = (): void => {
  apiCache.clear();
  activeRequests.clear();
}