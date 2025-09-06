import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface MainNavigationProps {
  onAuthRequired: (mode: 'login' | 'signup') => void;
  isMobile?: boolean;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ onAuthRequired, isMobile = false }) => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const navigationItems = [
    { label: 'Discover', href: '#', requiresAdmin: false },
    { label: 'Browse', href: '#', requiresAdmin: false },
    { label: 'Categories', href: '#', requiresAdmin: true },
    { label: 'Collections', href: '#', requiresAdmin: true },
    { label: 'Recordings', href: '#', requiresAdmin: true },
  ];

  const filteredNavItems = navigationItems.filter(item => !item.requiresAdmin || isAdmin);

  if (isMobile) {
    return (
      <nav className="flex flex-col space-y-3">
        {filteredNavItems.map((item) => (
          <a key={item.label} href={item.href} className="text-[#212124] font-medium">
            {item.label}
          </a>
        ))}
        {isAuthenticated ? (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            <button 
              onClick={logout}
              className="bg-gray-200 text-[#212124] px-6 py-3 rounded-lg font-bold w-full"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <button 
              onClick={() => onAuthRequired('login')}
              className="bg-[#212124] text-white px-6 py-3 rounded-lg font-bold w-full"
            >
              Sign In
            </button>
            <button 
              onClick={() => onAuthRequired('signup')}
              className="bg-[#B8FF4F] text-[#212124] px-6 py-3 rounded-lg font-bold w-full"
            >
              Request Access
            </button>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {filteredNavItems.map((item) => (
        <a 
          key={item.label} 
          href={item.href} 
          className="text-[#212124] font-medium hover:text-[#B8FF4F] transition-colors"
        >
          {item.label}
        </a>
      ))}
      {!isAuthenticated && (
        <button 
          onClick={() => onAuthRequired('login')}
          className="text-[#212124] font-medium hover:text-[#B8FF4F] transition-colors"
        >
          Sign In
        </button>
      )}
    </nav>
  );
};
