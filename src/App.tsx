import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronDown, ChevronUp, Menu, X, List, Headphones, Play } from 'lucide-react';
import { MainNavigation } from './components/Navigation/MainNavigation';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/Auth/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { RecordingNotice } from './components/RecordingNotice';
import { useAudioData } from './hooks/useAudioData';
import { GroupCard } from './components/GroupCard';
import { GroupRecordings } from './components/GroupRecordings';
import { PreviewGroupRecordings } from './components/PreviewGroupRecordings';
import { AllGroups } from './components/AllGroups';
import { SearchBar } from './components/SearchBar';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorMessage } from './components/ui/ErrorMessage';
import { normalizeText, isWithinDateRange } from './utils/search';
import { AuthMode } from './types/auth';

const testimonials = [
  {
    id: 1,
    quote: "aminoRecording has completely transformed how I access exclusive content. The leaked recordings are incredible and the audio quality is unmatched.",
    author: "Sarah Johnson",
    role: "Audio Enthusiast",
    rating: 5
  },
  {
    id: 2,
    quote: "As a content creator, I love how aminoRecording provides access to rare and exclusive audio content. The platform really understands what we're looking for.",
    author: "Mike Torres",
    role: "Content Creator",
    rating: 5
  }
];

const faqItems = [
  {
    question: "What audio quality does aminoRecording offer?",
    answer: "We provide lossless audio streaming up to 24-bit/192kHz for Premium subscribers, with high-quality 320kbps for all users."
  },
  {
    question: "How many recordings can I download offline?",
    answer: "Premium users can download unlimited songs for offline listening across up to 5 devices."
  },
  {
    question: "Do you have family plans?",
    answer: "Yes! Our Family Premium plan supports up to 6 accounts with individual profiles and recommendations for just $14.99/month."
  },
  {
    question: "Can I create and share playlists?",
    answer: "Absolutely! Create unlimited playlists, collaborate with friends, and share your musical discoveries with the community."
  }
];

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [view, setView] = useState<'main' | 'allGroups' | 'group'>('main');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { groups, loading, error, refetch } = useAudioData();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Debug authentication state
  useEffect(() => {
    console.log('Authentication state:', { isAuthenticated, user: user?.email });
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowAdmin(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedNdcId, setSelectedNdcId] = useState<number | null>(null);

  const selectedGroupData = selectedGroup ? groups.find(g => g.threadId === selectedGroup) : null;

  const handleAuthRequired = (mode: AuthMode = 'login') => {
    if (mode === 'login') {
      navigate('/login');
    } else if (mode === 'signup') {
      navigate('/signup-request');
    }
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
  };

  const handleGroupClick = (groupId: string, viewType: 'allGroups' | 'group') => {
    setSelectedGroup(groupId);
    setView(viewType);
  };

  const handleBack = () => {
    setView('main');
    setSelectedGroup(null);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  if (showAdmin) {
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-[#B8FF4F] relative overflow-x-hidden">
      <RecordingNotice />
      {/* Background overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#1C2B12]/20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#121212]/10"></div>
      
      {/* Header */}
      <header className="relative z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Headphones className="w-8 h-8 text-[#B8FF4F]" />
              <span className="text-2xl font-bold text-[#212124]">aminoRecording</span>
            </div>

            {/* Desktop Navigation */}
            <MainNavigation onAuthRequired={handleAuthRequired} />

            {/* CTA Button */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                  <button 
                    onClick={logout}
                    className="bg-gray-200 text-[#212124] px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleAuthRequired('signup')}
                  className="hidden md:block bg-[#B8FF4F] text-[#212124] px-6 py-3 rounded-lg font-bold hover:bg-[#A3E844] transition-colors"
                >
                  Request Access
                </button>
              )}
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
              <MainNavigation onAuthRequired={handleAuthRequired} isMobile />
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#212124] leading-tight">
                {isAuthenticated ? 'Welcome Back to Your Collection' : 'Experience Leaked Like Never Before'}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                {isAuthenticated ? 'Access your exclusive recordings and discover new content.' : 'Exclusive access. Rare recordings. Your content, your way.'}
              </p>
            </div>

            <button className="bg-[#212124] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>{isAuthenticated ? 'Start Listening' : 'Preview Content'}</span>
            </button>

            {/* Trust Logos */}
            <div className="pt-8">
              <p className="text-sm text-gray-500 mb-4">Trusted by content enthusiasts worldwide</p>
              <div className="flex flex-wrap items-center gap-6 opacity-60">
                <span className="text-2xl font-bold text-gray-400">Exclusive</span>
                <span className="text-2xl font-bold text-gray-400">Rare</span>
                <span className="text-2xl font-bold text-gray-400">Premium</span>
                <span className="text-2xl font-bold text-gray-400">Quality</span>
                <span className="text-2xl font-bold text-gray-400">Access</span>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="relative z-10 bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
              {/* Main Headphones Illustration */}
              <div className="relative mx-auto w-80 h-80 flex items-center justify-center">
                {/* Background circles */}
                <div className="absolute inset-0 border-4 border-[#B8FF4F]/30 rounded-full"></div>
                <div className="absolute inset-4 border-2 border-[#B8FF4F]/20 rounded-full"></div>
                
                {/* Central headphones */}
                <div className="relative z-10">
                  <Headphones className="w-32 h-32 text-[#212124]" />
                </div>

                {/* Floating elements */}
                <div className="absolute top-8 left-8 w-6 h-6 bg-[#B8FF4F] rounded-full"></div>
                <div className="absolute top-16 right-12 w-4 h-4 bg-[#212124] rounded-full"></div>
                <div className="absolute bottom-12 left-16 w-3 h-3 bg-[#B8FF4F] rotate-45"></div>
                <div className="absolute bottom-8 right-8 w-5 h-5 border-2 border-[#212124] rounded-full"></div>
                
                {/* Waveform indicators */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex space-x-1">
                  <div className="w-1 h-8 bg-[#B8FF4F] rounded-full"></div>
                  <div className="w-1 h-12 bg-[#B8FF4F] rounded-full"></div>
                  <div className="w-1 h-6 bg-[#B8FF4F] rounded-full"></div>
                  <div className="w-1 h-10 bg-[#B8FF4F] rounded-full"></div>
                </div>
                
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex space-x-1">
                  <div className="w-1 h-10 bg-[#B8FF4F] rounded-full"></div>
                  <div className="w-1 h-6 bg-[#B8FF4F] rounded-full"></div>
                  <div className="w-1 h-12 bg-[#B8FF4F] rounded-full"></div>
                  <div className="w-1 h-8 bg-[#B8FF4F] rounded-full"></div>
                </div>

                {/* Play button overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#B8FF4F] rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-8 h-8 text-[#212124] ml-1" />
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#B8FF4F] rounded-full"></div>
            <div className="absolute top-12 -right-2 w-6 h-6 border-2 border-[#212124] rotate-45"></div>
            <div className="absolute -bottom-2 left-8 w-4 h-4 bg-[#212124] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Groups Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 bg-gray-50">
        <div className="mb-6 sm:mb-8 flex flex-col space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="inline-block bg-[#B8FF4F] text-[#212124] px-4 py-2 rounded-lg font-bold text-sm mb-4">
                {isAuthenticated ? 'YOUR CONTENT' : 'LATEST GROUPS'}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#212124]">
                {isAuthenticated ? 'Your Recordings' : 'Discover Content'}
              </h2>
            </div>
            <button
              onClick={() => view === 'main' ? setView('allGroups') : handleBack()}
              className="flex items-center space-x-1 sm:space-x-2 bg-[#212124] text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors text-sm sm:text-base min-h-[44px]"
            >
              <List className="w-5 h-5" />
              <span className="hidden sm:inline">{view === 'main' ? 'Show All Groups' : 'Back'}</span>
              <span className="sm:hidden">{view === 'main' ? 'All' : 'Back'}</span>
            </button>
          </div>

          {/* Search and Filter - Always visible */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            startDate={startDate}
            endDate={endDate}
            onDateChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            selectedNdcId={selectedNdcId}
            onNdcIdChange={setSelectedNdcId}
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading groups...</p>
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={refetch} />
        ) : view === 'allGroups' ? (
          <AllGroups 
            groups={groups} 
            onBack={handleBack}
            onGroupClick={(groupId) => handleGroupClick(groupId, 'group')}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            startDate={startDate}
            endDate={endDate}
            onDateChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            selectedNdcId={selectedNdcId}
            onNdcIdChange={setSelectedNdcId}
          />
        ) : view === 'group' && selectedGroupData ? (
          <GroupRecordings group={selectedGroupData} onBack={handleBack} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
            {groups
              .filter(group => {
                const normalizedTitle = normalizeText(group.title);
                const normalizedSearch = normalizeText(searchTerm);
                const titleMatch = normalizedTitle.includes(normalizedSearch);
                const dateMatch = group.sid_info.some(recording => 
                  isWithinDateRange(recording.createdT, startDate, endDate)
                );
                const ndcMatch = !selectedNdcId || group.ndcId === selectedNdcId;
                return titleMatch && dateMatch && ndcMatch;
              })
              .slice(0, 6)
              .map((group, index) => (
                <GroupCard
                  key={group.threadId}
                  group={group}
                  index={index}
                  onClick={() => handleGroupClick(group.threadId, 'group')}
                />
              ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="inline-block bg-[#B8FF4F] text-[#212124] px-4 py-2 rounded-lg font-bold text-sm mb-4">
            TESTIMONIALS
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#212124]">
            What Our Users Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="relative">
              <div className="bg-[#212124] rounded-2xl p-8 text-white">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#B8FF4F] fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <cite className="not-italic">
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-gray-300">{testimonial.role}</div>
                </cite>
              </div>
              
              {/* Speech bubble tail */}
              <div className="absolute bottom-0 left-8 w-0 h-0 border-l-[20px] border-r-[20px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#212124]"></div>
              <div className="absolute -bottom-1 left-10 w-4 h-4 bg-[#B8FF4F] rounded-full"></div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <span className="inline-block bg-[#B8FF4F] text-[#212124] px-4 py-2 rounded-lg font-bold text-sm mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#212124]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <button
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-bold text-[#212124] text-lg">{item.question}</span>
                {openFaqIndex === index ? (
                  <ChevronUp className="w-6 h-6 text-[#B8FF4F]" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-[#B8FF4F]" />
                )}
              </button>
              {openFaqIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      {!isAuthenticated && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-r from-[#212124] to-gray-800 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Access Exclusive Content?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who've discovered exclusive content on aminoRecording.
            </p>
            <button 
              onClick={() => handleAuthRequired('signup')}
              className="bg-[#B8FF4F] text-[#212124] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#A3E844] transition-colors shadow-lg"
            >
              Request Access
            </button>
          </div>
        </section>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        initialMode={authMode}
      />
    </div>
  );
}

export default App;