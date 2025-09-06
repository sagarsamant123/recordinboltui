import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  Key, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  Copy, 
  X,
  LogOut,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../services/authApi';
import { AccessRequest, GeneratedPassword } from '../../types/auth';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

export const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedPasswords, setGeneratedPasswords] = useState<GeneratedPassword[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState<Set<string>>(new Set());
  const [hasFetched, setHasFetched] = useState(false);
  
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const doFetchRequests = useCallback(async (force = false) => {
    // Prevent multiple simultaneous calls unless forced
    if (!force && (loading || hasFetched)) {
      console.log('Skipping fetch - already loading or fetched');
      return;
    }

    if (!isAuthenticated || !isAdmin) {
      console.log('Not authenticated or not admin, skipping fetch');
      return;
    }

    console.log('fetchRequests called');
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.getAccessRequests();
      console.log('API Response:', response);
      if (response.success) {
        setRequests(response.requests);
        setHasFetched(true);
      } else {
        setError('Failed to load access requests');
      }
    } catch (err) {
      setError('Network error while loading requests');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, loading, hasFetched]);

  // Handle auth state changes first
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
    } else if (!isAdmin) {
      console.log('Not admin, redirecting to home');
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Fetch data only after auth is confirmed
  useEffect(() => {
    if (isAuthenticated && isAdmin && !hasFetched && !loading) {
      console.log('Initial fetch of requests...');
      doFetchRequests();
    }
  }, [isAuthenticated, isAdmin, hasFetched, loading, doFetchRequests]);

  const handleSelectRequest = (requestId: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleSelectAll = () => {
    const pendingRequests = requests.filter(req => req.status === 'pending');
    if (selectedRequests.size === pendingRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(pendingRequests.map(req => req.id)));
    }
  };

  const handleGeneratePasswords = async () => {
    if (selectedRequests.size === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const selectedEmails = requests
        .filter(req => selectedRequests.has(req.id))
        .map(req => req.email);

      const response = await authApi.generatePasswords({ emails: selectedEmails });
      
      if (response.success) {
        setGeneratedPasswords(response.results);
        setShowPasswords(true);
        setSelectedRequests(new Set());
        // Refresh requests to update status
        await doFetchRequests(true); // Force refresh
      } else {
        setError(response.message || 'Failed to generate passwords');
      }
    } catch (err) {
      setError('Network error while generating passwords');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setHasFetched(false);
    doFetchRequests(true);
  }, [doFetchRequests]);
  const copyToClipboard = async (text: string, email: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmails(prev => new Set([...prev, email]));
      setTimeout(() => {
        setCopiedEmails(prev => {
          const newSet = new Set(prev);
          newSet.delete(email);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#B8FF4F]" />
              <div>
                <h1 className="text-2xl font-bold text-[#212124]">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage access requests and user accounts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(req => req.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">Access Requests</h2>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              {selectedRequests.size > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedRequests.size} selected
                  </span>
                  <button
                    onClick={handleGeneratePasswords}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-[#B8FF4F] text-[#212124] px-4 py-2 rounded-lg font-medium hover:bg-[#A3E844] disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Generate Passwords
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Loading requests...</span>
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorMessage message={error} onRetry={handleRefresh} />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No access requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        {selectedRequests.size === pendingRequests.length && pendingRequests.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-[#B8FF4F]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                        Select All
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleSelectRequest(request.id)}
                            className="flex items-center justify-center"
                          >
                            {selectedRequests.has(request.id) ? (
                              <CheckSquare className="w-4 h-4 text-[#B8FF4F]" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{request.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Generated Passwords Modal */}
        {showPasswords && generatedPasswords.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Key className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Generated Passwords</h3>
                    <p className="text-sm text-gray-600">Passwords have been created for selected users</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswords(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {generatedPasswords.map((result) => (
                    <div key={result.email} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{result.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">Password:</span>
                            <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                              {result.password}
                            </code>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`Email: ${result.email}\nPassword: ${result.password}`, result.email)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          {copiedEmails.has(result.email) ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Important:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Share these credentials securely with the approved users</li>
                    <li>• Users should change their passwords after first login</li>
                    <li>• These passwords will not be shown again</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};