'use client';

import Link from "next/link";
import { useState } from 'react';
import SavedServiceCard from './saved-service-card';
import type { Favorite as ApiFavorite } from "@/lib/api-client";

type Favorite = ApiFavorite;

type SavedServicesListProps = {
  initialFavorites: Favorite[];
};

export default function SavedServicesList({ initialFavorites }: SavedServicesListProps) {
  const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites);

  const handleRemove = (favoriteId: number) => {
    setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No saved services yet</h3>
        <p className="text-gray-500 mb-6">Save services you're interested in to find them easily later.</p>
        <Link href="/services" className="text-blue-600 hover:text-blue-700 font-medium">
          Browse Services →
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
        Saved Services ({favorites.length})
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => (
          <SavedServiceCard
            key={favorite.id}
            favorite={favorite}
            onRemove={handleRemove}
          />
        )).filter(Boolean)}
      </div>
    </>
  );
}
