'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

type City = {
  id: number;
  name: string;
  region: string;
  province: string | null;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder = "City or area",
  className = ""
}: Props) {
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/dev/cities?search=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSuggestions(data.cities || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (city: City) => {
    onChange(city.name);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Popular NCR cities to show when field is focused but empty
  const popularCities = [
    'Makati', 'BGC', 'Quezon City', 'Manila', 'Pasig', 'Ortigas', 
    'Mandaluyong', 'Taguig', 'Alabang', 'Marikina'
  ];

  const showPopularCities = !value && showSuggestions;
  const hasResults = suggestions.length > 0;

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        className={className}
        autoComplete="off"
      />
      
      {showSuggestions && (showPopularCities || hasResults) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {loading && (
            <div className="px-4 py-2 text-sm text-gray-500">
              Searching...
            </div>
          )}
          
          {showPopularCities && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                Popular Cities
              </div>
              {popularCities.map((cityName) => (
                <button
                  key={cityName}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 focus:bg-blue-50 focus:outline-none"
                  onClick={() => handleSelectSuggestion({ id: 0, name: cityName, region: 'NCR', province: null })}
                >
                  <div className="flex items-center justify-between">
                    <span>{cityName}</span>
                    <span className="text-xs text-gray-400">NCR</span>
                  </div>
                </button>
              ))}
            </>
          )}
          
          {hasResults && !loading && (
            <>
              {showPopularCities && <div className="border-t" />}
              {suggestions.map((city) => (
                <button
                  key={city.id}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 focus:bg-blue-50 focus:outline-none"
                  onClick={() => handleSelectSuggestion(city)}
                >
                  <div className="flex items-center justify-between">
                    <span>{city.name}</span>
                    <span className="text-xs text-gray-400">
                      {city.region === 'NCR' ? 'NCR' : `${city.region}${city.province ? `, ${city.province}` : ''}`}
                    </span>
                  </div>
                </button>
              ))}
            </>
          )}
          
          {!hasResults && !loading && value && (
            <div className="px-4 py-2 text-sm text-gray-500">
              No cities found for "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
