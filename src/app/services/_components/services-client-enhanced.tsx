'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ServiceSearchBox from './service-searchbox';
import { ServiceCard, type Service } from './service-card';

type SearchResults = {
  services: Service[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    query?: string;
    category?: string;
    location?: string;
    date?: string;
    time?: string;
    sortBy?: string;
  };
};

type Props = {
  services: Service[];
  initialQ?: string;
  initialCategory?: string;
  emptyState?: React.ReactNode;
};

export default function ServicesClientEnhanced({
  services: initialServices,
  initialQ = '',
  initialCategory = '',
  emptyState = <div className="text-sm opacity-70">No services match your filters.</div>,
}: Props) {
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState<string | undefined>(
    initialCategory && initialCategory !== 'all' ? initialCategory : undefined
  );
  const [services, setServices] = useState<Service[]>(initialServices);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Categories to display
  const categories: Array<Service['category']> = ['Cleaning', 'Repair', 'Pets', 'Lessons'];

  // Debounced search function
  const searchServices = useCallback(async (searchQuery: string, searchCategory?: string) => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (searchCategory) params.set('category', searchCategory);
      
      const response = await fetch(`/api/dev/services?${params.toString()}`);
      const data: SearchResults = await response.json();
      
      setSearchResults(data);
      setServices(data.services || []);
      
      // Log search analytics
      if (searchQuery || searchCategory) {
        fetch('/api/dev/search/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            category: searchCategory,
            results_count: data.services?.length || 0
          })
        }).catch(() => {}); // Ignore analytics errors
      }
    } catch (error) {
      console.error('Search failed:', error);
      setServices(initialServices);
    } finally {
      setLoading(false);
    }
  }, [initialServices]);

  // Debounce search calls
  useEffect(() => {
    const timer = setTimeout(() => {
      searchServices(q, category);
    }, 300);

    return () => clearTimeout(timer);
  }, [q, category, searchServices]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }

    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams.toString()}`) {
      router.push(newUrl, { scroll: false });
    }
  }, [q, category, pathname, router, searchParams]);

  const handleSearchChange = ({ q: newQ, category: newCategory }: { q: string; category: string }) => {
    setQ(newQ);
    setCategory(newCategory || undefined);
  };

  return (
    <div className="space-y-8">
      <ServiceSearchBox
        q={q}
        category={category ?? ''}
        categories={categories}
        onChange={handleSearchChange}
        showReset={true}
      />

      {/* Search Results Info */}
      {searchResults && (q || category) && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {loading ? (
              <span>Searching...</span>
            ) : (
              <span>
                Found {searchResults.pagination.total} services
                {q && ` for "${q}"`}
                {category && ` in ${category}`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Services Grid */}
      {!loading && (
        <>
          {services.length === 0 ? (
            <div className="text-center py-12">
              {emptyState}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
