'use client';

import * as React from 'react';
import { useMemo, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ServiceSearchBox from './service-searchbox';
import { ServiceCard, type Service } from './service-card';

function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function textOf(s: Service) {
  return [s.name ?? '', s.description ?? '', s.category ?? '']
    .join(' ')
    .toLowerCase();
}

type Props = {
  services: Service[];
  initialQ?: string;
  initialCategory?: string;
  emptyState?: React.ReactNode;
};

export default function ServicesClient({
  services,
  initialQ = '',
  initialCategory = '',
  emptyState = <div className="text-sm opacity-70">No services match your filters.</div>,
}: Props) {
  const [q, setQ] = useState(initialQ);

  // Treat undefined as "All"
  const [category, setCategory] = useState<string | undefined>(
    initialCategory && initialCategory !== 'all' ? initialCategory : undefined
  );
  const debouncedQ = useDebounced(q, 250);

  // 🔽 HARD-LIMIT categories to your 4 focus areas
  const categories: Array<Service['category']> = ['Cleaning', 'Repair', 'Pets', 'Lessons'];

  const filtered = useMemo(() => {
    const qLower = debouncedQ.toLowerCase();
    return services.filter((s) => {
      const inCat =
        !category ||
        (s.category ?? '').toLowerCase() === category.toLowerCase();
      const matches = !qLower || textOf(s).includes(qLower);
      return inCat && matches;
    });
  }, [services, debouncedQ, category]);

  // URL sync (?q=&category=)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams(searchParams?.toString());
    debouncedQ ? next.set('q', debouncedQ) : next.delete('q');
    category ? next.set('category', category) : next.delete('category');

    const href = `${pathname}${next.toString() ? `?${next.toString()}` : ''}`;
    router.replace(href, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, category]);

  return (
    <>
      <ServiceSearchBox
        q={q}
        category={category || ''}         // convert undefined to empty string
        categories={categories}           // now a fixed list
        onChange={({ q, category }) => {
          setQ(q);
          setCategory(category || undefined);          // convert empty string back to undefined
        }}
      />

      {filtered.length === 0 ? (
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
          {filtered.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </>
  );
}
