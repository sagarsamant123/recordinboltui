import React from 'react';
import { Search, Calendar } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  selectedNdcId: number | null;
  onNdcIdChange: (ndcId: number | null) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  startDate,
  endDate,
  onDateChange,
  selectedNdcId,
  onNdcIdChange,
}) => {
  const ndcOptions = [
    { id: 195570892, name: "Army's" },
    { id: 86797652, name: "Indian's" }
  ];
  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search groups..."
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#B8FF4F] focus:outline-none text-base"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* NDC Filter */}
        <select
          value={selectedNdcId || ''}
          onChange={(e) => onNdcIdChange(e.target.value ? Number(e.target.value) : null)}
          className="flex-1 sm:flex-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#B8FF4F] focus:outline-none text-base min-h-[44px]"
        >
          <option value="">All Groups</option>
          {ndcOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        {/* Date filters - Mobile optimized */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1 sm:flex-none">
          <div className="relative flex-1 sm:flex-none">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="date"
              value={startDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => {
                const newStartDate = e.target.value ? new Date(e.target.value) : null;
                onDateChange(newStartDate, endDate);
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#B8FF4F] focus:outline-none text-base min-h-[44px]"
              placeholder="Start date"
            />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="date"
              value={endDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => {
                const newEndDate = e.target.value ? new Date(e.target.value) : null;
                onDateChange(startDate, newEndDate);
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#B8FF4F] focus:outline-none text-base min-h-[44px]"
              placeholder="End date"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
