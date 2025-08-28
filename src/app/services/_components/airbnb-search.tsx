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

// Icons
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

type SearchFilters = {
  q: string;
  category: string;
  date: string;
  time: string;
  location: string;
};

type Props = {
  q: string;
  category: string;
  categories: string[];
  onChange: (next: { q: string; category: string }) => void;
  showReset?: boolean;
};

export default function AirbnbSearch({
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

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update the parent component with basic filters
    if (key === 'q' || key === 'category') {
      onChange({ q: newFilters.q, category: newFilters.category });
    }
  };

  const handleSearch = () => {
    onChange({ q: filters.q, category: filters.category });
    setIsExpanded(false);
  };

  const reset = () => {
    const resetFilters = { q: '', category: '', date: '', time: 'any', location: '' };
    setFilters(resetFilters);
    onChange({ q: '', category: '' });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="w-full mb-6">
      {/* Main Search Bar */}
      <div 
        className={`bg-white shadow-lg border rounded-full transition-all duration-300 ${
          isExpanded ? 'rounded-2xl shadow-xl' : 'hover:shadow-xl'
        }`}
      >
        {!isExpanded ? (
          /* Collapsed Search Bar */
          <div 
            className="flex items-center p-4 cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex-1 flex items-center gap-4">
              <SearchIcon />
              <div className="flex-1">
                <span className="text-sm font-medium">
                  {filters.q || 'What service do you need?'}
                </span>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  {filters.location && <span>{filters.location}</span>}
                  {filters.date && <span>• {filters.date}</span>}
                  {filters.time && filters.time !== 'any' && <span>• {filters.time}</span>}
                </div>
              </div>
            </div>
            <Button size="sm" className="rounded-full">
              <SearchIcon />
            </Button>
          </div>
        ) : (
          /* Expanded Search Form */
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Service Search */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  What
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Can I help you?"
                    value={filters.q}
                    onChange={(e) => updateFilter('q', e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Where
                </label>
                <div className="relative">
                  <LocationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Add location"
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  When
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="date"
                    min={getTodayDate()}
                    value={filters.date}
                    onChange={(e) => updateFilter('date', e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Time
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Select value={filters.time || 'any'} onValueChange={(value) => updateFilter('time', value === 'any' ? '' : value)}>
                    <SelectTrigger className="pl-10 h-12 border-gray-200 focus:border-blue-500">
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

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Category
              </label>
              <Select value={filters.category || 'all'} onValueChange={(value) => updateFilter('category', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Active Filters Display */}
      {!isExpanded && (filters.q || filters.category || filters.date || (filters.time && filters.time !== 'any') || filters.location) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.q && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
              "{filters.q}"
              <button onClick={() => updateFilter('q', '')} className="hover:text-blue-900">×</button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              {filters.category}
              <button onClick={() => updateFilter('category', '')} className="hover:text-gray-900">×</button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
              📍 {filters.location}
              <button onClick={() => updateFilter('location', '')} className="hover:text-green-900">×</button>
            </span>
          )}
          {filters.date && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
              📅 {filters.date}
              <button onClick={() => updateFilter('date', '')} className="hover:text-purple-900">×</button>
            </span>
          )}
          {filters.time && filters.time !== 'any' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full">
              🕐 {filters.time}
              <button onClick={() => updateFilter('time', 'any')} className="hover:text-orange-900">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
