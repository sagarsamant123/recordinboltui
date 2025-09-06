import React from 'react';
import { Headphones, Play, Clock, Calendar } from 'lucide-react';
import { GroupData } from '../types/api';
import { formatToIndianDateTime } from '../utils/dateTime';

interface GroupCardProps {
  group: GroupData;
  index: number;
  onClick: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, index, onClick }) => {
  const isEven = index % 2 === 0;
  
  // Get the most recent recording date
  const latestRecording = group.sid_info.reduce((latest, current) => 
    new Date(current.createdT) > new Date(latest.createdT) ? current : latest
  );
  
  return (
    <div 
      onClick={onClick}
      className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${
        isEven 
          ? 'bg-white border-gray-200' 
          : 'bg-[#212124] border-[#212124] text-white'
      } hover:shadow-xl transition-all duration-300 group cursor-pointer`}
    >
      <div className="relative mb-4">
        <div className={`w-full h-24 sm:h-32 rounded-lg flex items-center justify-center ${
          isEven ? 'bg-gray-100' : 'bg-gray-800'
        }`}>
          {group.iconUrl && group.iconUrl.trim() !== '' ? (
            <img 
              src={group.iconUrl} 
              alt={group.title}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : (
            null
          )}
          <div className={`${group.iconUrl ? 'hidden' : ''} w-12 h-12 ${
              isEven ? 'text-gray-400' : 'text-gray-600'
            }`}>
            <Headphones className="w-full h-full" />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Play className="w-8 h-8 text-white" />
        </div>
      </div>
      <h3 className={`text-xl font-bold mb-2 ${isEven ? 'text-[#212124]' : 'text-white'} truncate`}>
        {group.title}
      </h3>
      <p className={`text-sm mb-3 ${isEven ? 'text-gray-600' : 'text-gray-300'}`}>
        Exclusive recordings from this group
      </p>
      
      {/* Additional info */}
      <div className={`text-xs mb-3 flex items-center gap-2 ${isEven ? 'text-gray-500' : 'text-gray-400'}`}>
        <Calendar className="w-3 h-3" />
        <span>Latest: {formatToIndianDateTime(latestRecording.createdT)}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isEven ? 'text-[#212124]' : 'text-[#B8FF4F]'}`}>
          {group.sid_info.length} recordings
        </span>
        <div className={`w-6 h-6 rounded-full bg-[#B8FF4F] flex items-center justify-center`}>
          <Play className="w-3 h-3 text-[#212124]" />
        </div>
      </div>
    </div>
  );
};
