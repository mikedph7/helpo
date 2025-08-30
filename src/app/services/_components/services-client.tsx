'use client';

import * as React from 'react';
import { useMemo, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ServiceSearchBox from './service-searchbox';
import { ServiceCard } from './service-card';
import type { Service } from '@/lib/api-client';

function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type Props = {
  services: Service[];
  initialQ?: string;
  initialCategory?: string;
  initialLocation?: string;
  initialDate?: string;
  initialTime?: string;
  emptyState?: React.ReactNode;
};

export default function ServicesClient({
  services: initialServices,
  initialQ = '',
  initialCategory = '',
  initialLocation = '',
  initialDate = '',
  initialTime = '',
  emptyState = <div className="text-sm opacity-70">No services match your filters.</div>,
}: Props) {
  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLocation);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Treat undefined as "All"
  const [category, setCategory] = useState<string | undefined>(
    initialCategory && initialCategory !== 'all' ? initialCategory : undefined
  );
  const debouncedQ = useDebounced(q, 250);
  const debouncedLocation = useDebounced(location, 250);

  // 🔽 HARD-LIMIT categories to your 4 focus areas
  const categories: Array<Service['category']> = ['Cleaning', 'Repair', 'Pets', 'Lessons'];

  // Fetch services when search parameters change
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQ) params.set('q', debouncedQ);
        if (category) params.set('category', category);
        if (debouncedLocation) params.set('location', debouncedLocation);
        if (date) params.set('date', date);
        if (time && time !== 'any') params.set('time', time);

        const url = `/api/dev/services${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        setServices(data.services || []);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        // Keep current services on error
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have search parameters different from initial
    const hasChanged = 
      debouncedQ !== initialQ ||
      category !== (initialCategory && initialCategory !== 'all' ? initialCategory : undefined) ||
      debouncedLocation !== initialLocation ||
      date !== initialDate ||
      time !== initialTime;

    if (hasChanged) {
      fetchServices();
    }
  }, [debouncedQ, category, debouncedLocation, date, time, initialQ, initialCategory, initialLocation, initialDate, initialTime]);

  // URL sync (?q=&category=&location=&date=&time=)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams(searchParams?.toString());
    debouncedQ ? next.set('q', debouncedQ) : next.delete('q');
    category ? next.set('category', category) : next.delete('category');
    debouncedLocation ? next.set('location', debouncedLocation) : next.delete('location');
    date ? next.set('date', date) : next.delete('date');
    time && time !== 'any' ? next.set('time', time) : next.delete('time');

    const href = `${pathname}${next.toString() ? `?${next.toString()}` : ''}`;
    router.replace(href, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, category, debouncedLocation, date, time]);

  // Fetch favorites once when component mounts
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/dev/favorites?user_id=42');
        if (response.ok) {
          const data = await response.json();
          const favoritesArray = data.favorites || []; // Extract the favorites array
          setFavorites(favoritesArray.map((fav: any) => fav.service_id));
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      }
    };
    
    fetchFavorites();
  }, []);

  // Function to update favorites list
  const updateFavorites = (serviceId: number, isFavorited: boolean) => {
    if (isFavorited) {
      setFavorites(prev => [...prev, serviceId]);
    } else {
      setFavorites(prev => prev.filter(id => id !== serviceId));
    }
  };

  return (
    <>
      <ServiceSearchBox
        q={q}
        category={category || ''}         // convert undefined to empty string
        location={location}
        date={date}
        time={time}
        categories={categories}           // now a fixed list
        onChange={({ q, category, location, date, time }) => {
          setQ(q);
          setCategory(category || undefined);          // convert empty string back to undefined
          setLocation(location || '');
          setDate(date || '');
          setTime(time || '');
        }}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">Loading services...</div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No services found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((s) => (
            <ServiceCard 
              key={s.id} 
              service={s as Service} 
              favorites={favorites} 
              onFavoriteChange={updateFavorites}
            />
          ))}
        </div>
      )}
    </>
  );
}
