"use client";

import { useState, useEffect } from "react";
import { createClientApiClient, type Favorite as ApiFavorite } from "@/lib/api-client";
import SavedServicesList from './_components/saved-services-list';
import { LoadingPage, LoadingGrid } from '@/components/ui/loading';

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Services</h1>
          <p className="text-gray-600">Your favorite services and providers</p>
        </div>
        
        <LoadingPage 
          title="Loading Saved Services" 
          message="Fetching your saved items..."
        />
        
        <LoadingGrid count={4} className="mt-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
      <SavedServicesList initialFavorites={favorites} />
    </div>
  );
}
