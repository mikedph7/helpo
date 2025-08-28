'use client';

import { useState, useEffect } from 'react';
import { getClientBaseUrl } from '@/lib/client-base-url';

type FavoriteButtonProps = {
  serviceId: string;
};

export default function FavoriteButton({ serviceId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorite status from API on mount
  useEffect(() => {
    checkFavoriteStatus();
  }, [serviceId]);

  // Check if service is in user's favorites
  const checkFavoriteStatus = async () => {
    try {
      const base = getClientBaseUrl();
      const response = await fetch(`${base}/api/dev/favorites`);
      if (response.ok) {
        const favorites = await response.json();
        const isFav = favorites.some((fav: any) => fav.service_id === serviceId);
        setIsFavorited(isFav);
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add service to favorites
  const addToFavorites = async () => {
    try {
      const base = getClientBaseUrl();
      const response = await fetch(`${base}/api/dev/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service_id: serviceId }),
      });

      if (response.ok) {
        setIsFavorited(true);
        return true;
      } else if (response.status === 409) {
        // Already favorited
        setIsFavorited(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      return false;
    }
  };

  // Remove service from favorites
  const removeFromFavorites = async () => {
    try {
      const base = getClientBaseUrl();
      const response = await fetch(`${base}/api/dev/favorites`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service_id: serviceId }),
      });

      if (response.ok) {
        setIsFavorited(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return false;
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      let success = false;
      
      if (isFavorited) {
        success = await removeFromFavorites();
      } else {
        success = await addToFavorites();
      }

      if (!success) {
        // Optionally show error message
        console.error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleFavorite}
      disabled={isLoading}
      className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg transition-all z-10 disabled:opacity-50"
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg 
        className={`w-6 h-6 transition-colors ${
          isFavorited 
            ? 'text-red-500 fill-current' 
            : 'text-gray-600 hover:text-red-500'
        }`} 
        fill={isFavorited ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}
