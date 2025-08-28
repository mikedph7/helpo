'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchSuggestions, usePopularSearches } from '@/hooks/use-search-suggestions';
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
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

export default function SmartSearchBox({
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { suggestions } = useSearchSuggestions(filters.q, showSuggestions);
  const { popularSearches } = usePopularSearches();

  // Get category display names
  const getCategoryDisplayName = (cat: string) => {
    const names: Record<string, string> = {
      'Cleaning': 'Home Care',
      'Repair': 'Fix It',
      'Pets': 'Pet Care',
      'Lessons': 'Learn'
    };
    return names[cat] || cat;
  };

  // Category icons
  const getCategoryIcon = (cat: string, className = "w-5 h-5") => {
    const icons = {
      'Cleaning': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
      'Repair': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      ),
      'Pets': (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        </svg>
      ),
      'Lessons': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    };
    return icons[cat as keyof typeof icons] || icons['Cleaning'];
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (key === 'q' || key === 'category') {
      onChange({ q: newFilters.q, category: newFilters.category });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    updateFilter('q', suggestion);
    setShowSuggestions(false);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full mb-8" ref={searchRef}>
      {/* Category Pills */}
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

      {/* Smart Search Input */}
      <div className="relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Can I help you?"
            value={filters.q}
            onChange={(e) => {
              updateFilter('q', e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (filters.q.length >= 2 || popularSearches.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
            {filters.q.length >= 2 && suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 px-2 py-1">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2"
                  >
                    <SearchIcon className="w-3 h-3 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {filters.q.length < 2 && popularSearches.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 px-2 py-1">Popular searches</div>
                {popularSearches.slice(0, 6).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search.term)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <SearchIcon className="w-3 h-3 text-gray-400" />
                      {search.term}
                    </div>
                    <span className="text-xs text-gray-400">{search.count} searches</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
