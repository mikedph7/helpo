"use client";

import { useState, useEffect } from "react";
import { createClientApiClient, type Favorite as ApiFavorite } from "@/lib/api-client";
import SavedServicesList from './_components/saved-services-list';

// Use the API types
type Favorite = ApiFavorite;

export default function SavedPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const apiClient = createClientApiClient();
        const { favorites } = await apiClient.getFavorites({ user_id: 42 });
        setFavorites(favorites || []);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
      <SavedServicesList initialFavorites={favorites} />
    </div>
  );
}
