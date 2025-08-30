'use client';

import { useState, useEffect } from 'react';
import { getClientBaseUrl } from '@/lib/client-base-url';

type FavoriteButtonProps = {
  serviceId: string;
};

export default function FavoriteButton({ serviceId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [serviceId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/dev/favorites?user_id=42`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch favorites: ${response.status}`);
      }
      
      const data = await response.json();
      const favorites = data.favorites || []; // Extract the favorites array from the response
      const serviceIdNum = parseInt(serviceId);
      const isFav = favorites.some((fav: any) => fav.service_id === serviceIdNum);
      
      setIsFavorited(isFav);
    } catch (error) {
      console.error('Error checking favorite status:', error);
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
        body: JSON.stringify({ user_id: 42, service_id: parseInt(serviceId) }),
      });

      if (response.ok) {
        setIsFavorited(true);
        return true;
      } else if (response.status === 409) {
        // Already favorited
        setIsFavorited(true);
        return true;
      } else {
        console.error('Error adding to favorites:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  };

  // Remove service from favorites
  const removeFromFavorites = async () => {
    try {
      const base = getClientBaseUrl();
      const response = await fetch(`${base}/api/dev/favorites?user_id=42&service_id=${parseInt(serviceId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsFavorited(false);
        return true;
      } else {
        console.error('Error removing from favorites:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  };

  // Toggle favorite status
  const handleToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    let success = false;
    if (isFavorited) {
      success = await removeFromFavorites();
    } else {
      success = await addToFavorites();
    }
    
    if (!success) {
      // Revert on failure
      setIsFavorited(!isFavorited);
    }
    
    setIsLoading(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleToggle();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white/90 transition-all duration-200"
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        className={`transition-colors duration-200 ${
          isFavorited 
            ? "fill-red-500 text-red-500" 
            : "fill-none text-gray-600 hover:text-red-500"
        }`}
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
}
