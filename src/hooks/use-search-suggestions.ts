// src/hooks/use-search-suggestions.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

type Suggestion = string;

export function useSearchSuggestions(query: string, enabled: boolean = true) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2 || !enabled) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      params.set('limit', '8');
      
      const response = await fetch(`/api/dev/search/suggestions?${params.toString()}`);
      const data = await response.json();
      
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 200); // Shorter delay for suggestions

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  return { suggestions, loading };
}

export function usePopularSearches() {
  const [popularSearches, setPopularSearches] = useState<Array<{
    term: string;
    category: string;
    count: number;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPopularSearches = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('/api/dev/search/popular');
        const data = await response.json();
        setPopularSearches(data);
      } catch (error) {
        console.error('Failed to fetch popular searches:', error);
        setPopularSearches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularSearches();
  }, []);

  return { popularSearches, loading };
}
