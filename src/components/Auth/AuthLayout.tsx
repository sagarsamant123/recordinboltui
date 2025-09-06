import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Headphones } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-[#B8FF4F]">
      {/* Header */}
      <header className="relative z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Headphones className="w-8 h-8 text-[#B8FF4F]" />
            <span className="text-2xl font-bold text-[#212124]">aminoRecording</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};