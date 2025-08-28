'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

type Props = {
  q: string;
  category: string;
  categories: string[];
  onChange: (next: { q: string; category: string }) => void;
  showReset?: boolean;
};

export default function FilterControls({
  q,
  category,
  categories,
  onChange,
  showReset = true,
}: Props) {
  const onQ = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ q: e.target.value, category });

 const onCat = (value: string) =>
  onChange({ q, category: value === 'all' ? '' : value });


  const reset = () => onChange({ q: '', category: '' });

  return (
    <div className="w-full bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-2xl p-3 md:p-4 mb-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 items-end">
        <div className="md:col-span-3 flex flex-col gap-2">
          <Label htmlFor="service-search">Search</Label>
          <Input
            id="service-search"
            placeholder="Search services…"
            value={q}
            onChange={onQ}
            aria-label="Search services"
          />
        </div>

        <div className="md:col-span-1 flex flex-col gap-2">
          <Label htmlFor="service-category">Category</Label>
          <Select value={category ?? 'all'} onValueChange={onCat}>
  <SelectTrigger id="service-category" aria-label="Filter by category">
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
      </div>

      {showReset && (q || category) ? (
        <div className="mt-3">
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
