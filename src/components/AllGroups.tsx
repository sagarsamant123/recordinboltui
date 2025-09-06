import React, { useState, useMemo } from 'react';
import { ChevronLeft, Headphones, Play } from 'lucide-react';
import { GroupData } from '../types/api';
import { SearchBar } from './SearchBar';
import { normalizeText, isWithinDateRange } from '../utils/search';

interface AllGroupsProps {
  groups: GroupData[];
  onBack: () => void;
  onGroupClick: (groupId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  selectedNdcId: number | null;
  onNdcIdChange: (ndcId: number | null) => void;
}

export const AllGroups: React.FC<AllGroupsProps> = ({ 
  groups, 
  onBack, 
  onGroupClick,
  searchTerm,
  onSearchChange,
  startDate,
  endDate,
  onDateChange,
  selectedNdcId,
  onNdcIdChange
}) => {

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      // Title search
      const normalizedTitle = normalizeText(group.title);
      const normalizedSearch = normalizeText(searchTerm);
      const titleMatch = normalizedTitle.includes(normalizedSearch);

      // Date filter
      const dateMatch = group.sid_info.some(recording => 
        isWithinDateRange(recording.createdT, startDate, endDate)
      );

      // NDC filter
      const ndcMatch = !selectedNdcId || group.ndcId === selectedNdcId;

      return titleMatch && dateMatch && ndcMatch;
    });
  }, [groups, searchTerm, startDate, endDate, selectedNdcId]);
  return (
    <div className="min-h-screen pb-safe">
      {/* Header */}
      <div className="mb-4 sm:mb-8 sticky top-0 bg-gray-50 z-10 pb-4">
        <div className="flex items-center space-x-2 sm:space-x-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#212124]">All Groups</h2>
            <p className="text-sm sm:text-base text-gray-600">{filteredGroups.length} of {groups.length} groups</p>
          </div>
        </div>
        
        {/* Search Bar - Mobile Optimized */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          startDate={startDate}
          endDate={endDate}
          onDateChange={onDateChange}
          selectedNdcId={selectedNdcId}
          onNdcIdChange={onNdcIdChange}
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
        {filteredGroups.map((group, index) => (
          <div 
            key={group.threadId} 
            onClick={() => onGroupClick(group.threadId)}
            className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${
              index % 2 === 0 
                ? 'bg-white border-gray-200' 
                : 'bg-[#212124] border-[#212124] text-white'
            } hover:shadow-xl transition-all duration-300 group cursor-pointer min-h-[200px] sm:min-h-[240px]`}
          >
            <div className="relative mb-4">
              <div className={`w-full h-24 sm:h-32 rounded-lg flex items-center justify-center ${
                index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-800'
              }`}>
                {group.iconUrl ? (
                  <img 
                    src={group.iconUrl} 
                    alt={group.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Headphones className={`w-8 h-8 sm:w-12 sm:h-12 ${
                    index % 2 === 0 ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                )}
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h3 className={`text-lg sm:text-xl font-bold mb-2 ${index % 2 === 0 ? 'text-[#212124]' : 'text-white'} line-clamp-2`}>
              {group.title}
            </h3>
            <p className={`text-xs sm:text-sm mb-3 ${index % 2 === 0 ? 'text-gray-600' : 'text-gray-300'}`}>
              Exclusive recordings from this group
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-xs sm:text-sm font-medium ${index % 2 === 0 ? 'text-[#212124]' : 'text-[#B8FF4F]'}`}>
                {group.sid_info.length} recordings
              </span>
              <div className={`w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-[#B8FF4F] flex items-center justify-center`}>
                <Play className="w-4 h-4 sm:w-3 sm:h-3 text-[#212124]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
