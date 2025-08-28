'use client';

import * as React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

// Icons - Fixed sizes
const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CalendarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LocationIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
  </svg>
);

const FilterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

// Category display names mapping
const getCategoryDisplayName = (category: string) => {
  const categoryNames: Record<string, string> = {
    'Cleaning': 'Home Care',
    'Repair': 'Fix It',
    'Pets': 'Pet Care', 
    'Lessons': 'Learn'
  };
  return categoryNames[category] || category;
};

// Category icons mapping with more personality
const getCategoryIcon = (category: string, className = "w-5 h-5") => {
  const icons = {
    'Cleaning': ( // Broom icon
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l2 2-2 2-2-2 2-2z" />
      </svg>
    ),
    'Repair': ( // Wrench icon
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
      </svg>
    ),
    'Pets': ( // Paw icon
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
    'Lessons': ( // Book with lightbulb concept
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 3" />
      </svg>
    )
  };
  return icons[category as keyof typeof icons] || icons['Cleaning'];
};

type SearchFilters = {
  q: string;
  category: string;
  date: string;
  time: string;
  location: string;
};

type RecentSearch = {
  q: string;
  category: string;
  date: string;
  time: string;
  location: string;
  timestamp: number;
};

type Props = {
  q: string;
  category: string;
  categories: string[];
  onChange: (next: { q: string; category: string }) => void;
  showReset?: boolean;
};

export default function ServiceSearchBox({
  q,
  category,
  categories,
  onChange,
  showReset = true,
}: Props) {
  const [filters, setFilters] = useState<SearchFilters>({
    q,
    category,
    date: '',
    time: 'any',
    location: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Popular services shortcuts
  const popularServices = [
    'Aircon Cleaning',
    'House Cleaning', 
    'Dog Walking',
    'Piano Tutor'
  ];

  // Load recent searches from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('helpo-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (search: Omit<RecentSearch, 'timestamp'>) => {
    // Only save if there's meaningful search content
    if (!search.q.trim() && !search.location.trim() && !search.date && !search.category) return;
    
    const newSearch: RecentSearch = {
      ...search,
      timestamp: Date.now()
    };

    setRecentSearches(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(s => 
        !(s.q === search.q && s.location === search.location && s.date === search.date && 
        s.time === search.time && s.category === search.category)
      );
      
      // Add to beginning and limit to 5
      return [newSearch, ...filtered].slice(0, 5);
    });

    // Save to localStorage
    localStorage.setItem('helpo-recent-searches', JSON.stringify([newSearch, ...recentSearches].slice(0, 5)));
  };

  const applyRecentSearch = (recentSearch: RecentSearch) => {
    const newFilters = {
      q: recentSearch.q,
      category: recentSearch.category,
      date: recentSearch.date,
      time: recentSearch.time,
      location: recentSearch.location
    };
    setFilters(newFilters);
    onChange({ q: newFilters.q, category: newFilters.category });
    setIsExpanded(false);
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (key === 'q' || key === 'category') {
      onChange({ q: newFilters.q, category: newFilters.category });
    }
  };

  const handleSearch = () => {
    const searchData = {
      q: filters.q,
      category: filters.category,
      date: filters.date,
      time: filters.time,
      location: filters.location
    };
    
    saveRecentSearch(searchData);
    onChange({ q: filters.q, category: filters.category });
    setIsExpanded(false);
  };

  const reset = () => {
    const resetFilters = { q: '', category: '', date: '', time: 'any', location: '' };
    setFilters(resetFilters);
    onChange({ q: '', category: '' });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('helpo-recent-searches');
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="w-full mb-8">
      {/* Category Filter Pills - Single Line */}
      <div className="mb-8">
        <div className="flex justify-center gap-4 md:gap-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
              className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 md:px-3 md:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-h-[60px] w-24 md:w-28 ${
                filters.category === cat
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:shadow-sm border border-gray-200'
              }`}
            >
              <div className={`${filters.category === cat ? 'text-white' : 'text-gray-400'}`}>
                {getCategoryIcon(cat, "w-5 h-5")}
              </div>
              <span className="text-center leading-tight">
                {getCategoryDisplayName(cat)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Search Bar */}
      <div 
        className={`bg-white shadow-lg border rounded-xl transition-all duration-300 ${
          isExpanded ? 'shadow-xl' : 'hover:shadow-xl'
        }`}
      >
        {!isExpanded ? (
          /* Collapsed Search Bar */
          <div 
            className="flex items-center p-4 cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex-1 flex items-center gap-4">
              <SearchIcon className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm font-medium">
                  {filters.q || 'Can I help you?'}
                </span>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  {filters.location && <span>{filters.location}</span>}
                  {filters.date && <span>• {filters.date}</span>}
                  {filters.time && filters.time !== 'any' && <span>• {filters.time}</span>}
                </div>
              </div>
            </div>
            <Button size="sm" className="rounded-lg mr-2">
              <FilterIcon className="w-4 h-4" />
            </Button>
            <Button size="sm" className="rounded-lg">
              <SearchIcon className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          /* Expanded Search Form */
          <div className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Service Search */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  What
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Can I help you?"
                    value={filters.q}
                    onChange={(e) => updateFilter('q', e.target.value)}
                    className="pl-10 h-10 text-sm border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Where
                </label>
                <div className="relative">
                  <LocationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="City or area"
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="pl-10 h-10 text-sm border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  When
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                  <Input
                    type="date"
                    value={filters.date}
                    min={getTodayDate()}
                    onChange={(e) => updateFilter('date', e.target.value)}
                    className="pl-10 h-10 text-sm border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Time
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                  <Select value={filters.time || 'any'} onValueChange={(value) => updateFilter('time', value === 'any' ? '' : value)}>
                    <SelectTrigger className="pl-10 h-10 text-sm border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
                      <SelectItem value="evening">Evening (6PM - 10PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {showReset && (filters.q || filters.category || filters.date || (filters.time && filters.time !== 'any') || filters.location) && (
                  <Button variant="ghost" size="sm" onClick={reset}>
                    Clear all
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                  <SearchIcon className="mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popular Services Shortcuts */}
      {!isExpanded && !filters.q && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Popular services</h3>
          <div className="flex flex-wrap gap-2">
            {popularServices.map((service) => (
              <button
                key={service}
                onClick={() => {
                  updateFilter('q', service);
                  setIsExpanded(false);
                }}
                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {!isExpanded && (filters.q || filters.category || filters.date || (filters.time && filters.time !== 'any') || filters.location) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.q && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
              "{filters.q}"
              <button onClick={() => updateFilter('q', '')} className="hover:text-blue-900">×</button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              {getCategoryDisplayName(filters.category)}
              <button onClick={() => updateFilter('category', '')} className="hover:text-gray-900">×</button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              📍 {filters.location}
              <button onClick={() => updateFilter('location', '')} className="hover:text-gray-900">×</button>
            </span>
          )}
          {filters.date && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              📅 {filters.date}
              <button onClick={() => updateFilter('date', '')} className="hover:text-gray-900">×</button>
            </span>
          )}
          {filters.time && filters.time !== 'any' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              🕐 {filters.time}
              <button onClick={() => updateFilter('time', '')} className="hover:text-gray-900">×</button>
            </span>
          )}
        </div>
      )}

      {/* Recent Searches */}
      {!isExpanded && recentSearches.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
            <button 
              onClick={clearRecentSearches}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => applyRecentSearch(search)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 text-sm rounded-full border hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <SearchIcon className="w-3 h-3 text-gray-400" />
                <span className="text-sm">
                  {search.q && <span className="font-medium">{search.q}</span>}
                  {search.location && (
                    <span className="text-gray-500">
                      {search.q ? ' • ' : ''}📍 {search.location}
                    </span>
                  )}
                  {search.date && (
                    <span className="text-gray-500">
                      {(search.q || search.location) ? ' • ' : ''}📅 {search.date}
                    </span>
                  )}
                  {search.category && (
                    <span className="text-blue-600">
                      {(search.q || search.location || search.date) ? ' • ' : ''}{getCategoryDisplayName(search.category)}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
