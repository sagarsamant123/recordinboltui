import { 
  LoginCredentials, 
  SignupRequestData, 
  AuthResponse, 
  AccessRequestsResponse, 
  GeneratePasswordsRequest, 
  GeneratePasswordsResponse 
} from '../types/auth';

const API_BASE_URL = 'https://v1hwz15p-6700.inc1.devtunnels.ms';

// Token storage keys
const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

class AuthApiService {
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private activeRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private getCachedData(key: string) {
    const cached = this.requestCache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.requestCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCachedData(key: string, data: any) {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const authToken = token || this.getStoredToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  }

  /**
   * Check if a token exists and has valid JWT structure
   */
  validateToken(): boolean {
    try {
      const token = this.getStoredToken();
      if (!token) return false;

      // Basic JWT structure validation (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Login attempt with:', credentials.email);
      // Clear any existing auth data before attempting login
      this.logout();

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('Login API response:', data);
      
      if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid credentials. Please try again.'
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          message: 'Too many login attempts. Please try again later.'
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'An error occurred during login. Please try again.'
        };
      }

      if (data.success && data.token && data.user) {
        // Validate token structure before storing
        if (typeof data.token !== 'string' || data.token.split('.').length !== 3) {
          console.error('Invalid token structure received');
          return {
            success: false,
            message: 'Invalid authentication token received'
          };
        }

        // Transform user data to match expected structure
        const userData = {
          ...data.user,
          // Ensure id is properly mapped
          id: data.user.id || data.user._id,
          // Ensure role is properly set
          role: data.user.email === 'admin@aminorecording.com' ? 'admin' : (data.user.role || 'user'),
          // Ensure isApproved is set
          isApproved: true,
          // Ensure createdAt is set
          createdAt: data.user.createdAt || new Date().toISOString()
        };

        console.log('Storing user data:', userData);

        // Store auth data
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        
        // Return the response with transformed user data
        return {
          success: true,
          token: data.token,
          user: userData,
          message: 'Login successful'
        };
      }

      // If we get here, something went wrong
      console.error('Login response missing required data:', data);
      return {
        success: false,
        message: 'Invalid response from server'
      };

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }

  async signupRequest(data: SignupRequestData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup-request`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.status === 409) {
        return {
          success: false,
          message: 'An account with this email already exists.'
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          message: 'Too many signup attempts. Please try again later.'
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: responseData.message || 'An error occurred during signup. Please try again.'
        };
      }

      return responseData;
    } catch (error) {
      console.error('Signup request error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }


  async getAccessRequests(): Promise<AccessRequestsResponse> {
    const cacheKey = 'access-requests';

    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      console.log('Using cached access requests data');
      return cachedData;
    }

    // Check if there's already a fetch in progress
    const existingPromise = this.activeRequests.get(cacheKey);
    if (existingPromise) {
      console.log('Using existing fetch promise');
      return existingPromise;
    }

    console.log('Fetching access requests...');
    const token = this.getStoredToken();
    console.log('Using token:', token ? 'Present' : 'Missing');

    try {
      // Create new fetch promise
      const fetchPromise = (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/requests`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
          });

          if (response.status === 401) {
            // Token expired, clear storage
            this.logout();
            const data = {
              success: false,
              requests: []
            };
            this.setCachedData(cacheKey, data);
            return data;
          }

          const data = await response.json();
          console.log('Access requests response:', data);
          this.setCachedData(cacheKey, data);
          return data;
        } finally {
          // Clean up the promise reference
          this.activeRequests.delete(cacheKey);
        }
      })();

      // Store the promise
      this.activeRequests.set(cacheKey, fetchPromise);
      return fetchPromise;
    } catch (error) {
      console.error('Get access requests error:', error);
      this.activeRequests.delete(cacheKey);
      return {
        success: false,
        requests: []
      };
    }
  }

  async generatePasswords(data: GeneratePasswordsRequest): Promise<GeneratePasswordsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/generate-passwords`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        // Token expired, clear storage
        this.logout();
        return {
          success: false,
          message: 'Session expired. Please log in again.',
          results: []
        };
      }
      return await response.json();
    } catch (error) {
      console.error('Generate passwords error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        results: []
      };
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.requestCache.clear(); // Clear cache on logout
    this.activeRequests.clear(); // Clear active requests on logout
  }

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getStoredUser(): any | null {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }
}

export const authApi = new AuthApiService();