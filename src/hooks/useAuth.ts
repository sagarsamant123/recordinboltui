import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthState, User, LoginCredentials, SignupRequestData, AuthResponse } from '../types/auth';
import { authApi } from '../services/authApi';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    token: null
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = authApi.getStoredToken();
        const userData = authApi.getStoredUser();
        console.log('Initializing auth:', { token: !!token, userData });
        
        if (token && userData) {
          // Validate token structure
          const isValid = authApi.validateToken();
          
          if (isValid) {
            // Ensure user data has all required fields
            const normalizedUserData = {
              ...userData,
              id: userData.id || userData._id,
              role: userData.role || (userData.email === 'admin@aminorecording.com' ? 'admin' : 'user'),
              isApproved: true
            };

            console.log('Setting auth state with user:', normalizedUserData);
            
            setAuthState({
              user: normalizedUserData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              token
            });
          } else {
            // Token is invalid, clear auth state
            console.log('Invalid token, clearing auth state');
            authApi.logout();
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Invalid session. Please log in again.',
              token: null
            });
          }
        } else {
          console.log('No stored auth data found');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authApi.logout();
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          user: null,
          isAuthenticated: false,
          token: null,
          error: 'Failed to initialize authentication' 
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login(credentials);

      if (response.success && response.user && response.token) {
        setAuthState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          token: response.token
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          user: null,
          isAuthenticated: false,
          token: null,
          error: response.message || 'Login failed'
        }));
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error && error.message.includes('Authentication expired') 
        ? 'Session expired. Please log in again.'
        : 'Network error. Please try again.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        user: null,
        isAuthenticated: false,
        token: null,
        error: errorMessage
      }));
      return { success: false, message: errorMessage };
    }
  }, []);

  const signupRequest = useCallback(async (data: SignupRequestData): Promise<AuthResponse> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.signupRequest(data);

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: response.success ? null : (response.message || 'Signup request failed')
      }));

      return response;
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, message: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null
    });
    
    // Clear API cache when logging out
    const { clearApiCache } = require('../utils/api');
    clearApiCache();
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const isAdmin = useMemo(() => {
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }

    const isAdminUser = authState.user.email === 'admin@aminorecording.com' || authState.user.role === 'admin';
    console.log('isAdmin check:', { 
      user: authState.user, 
      role: authState.user.role,
      email: authState.user.email,
      isAdmin: isAdminUser,
      isAuthenticated: authState.isAuthenticated
    });
    return isAdminUser;
  }, [authState.user, authState.isAuthenticated]);

  /**
   * Check and refresh authentication state
   */
  const refreshAuth = useCallback(async () => {
    const token = authApi.getStoredToken();
    const userData = authApi.getStoredUser();
    
    if (token && userData) {
      setAuthState(prev => ({
        ...prev,
        user: userData,
        isAuthenticated: true,
        token
      }));
    } else {
      logout();
    }
  }, [logout]);
  return {
    ...authState,
    login,
    signupRequest,
    logout,
    clearError,
    refreshAuth,
    isAdmin
  };
};