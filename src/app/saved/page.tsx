import Link from "next/link";
import Image from "next/image";
import { createServerApiClient, type Favorite as ApiFavorite } from "@/lib/api-client";

// Use the API types
type Favorite = ApiFavorite;

async function getFavorites(): Promise<Favorite[]> {
  try {
    const apiClient = await createServerApiClient();
    const { favorites } = await apiClient.getFavorites({ user_id: 42 });
    return favorites || [];
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return [];
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function SavedPage() {
  const favorites = await getFavorites();

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
          Saved Services
        </h1>
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
        Saved Services ({favorites.length})
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => {
          if (!favorite.service) return null; // Skip favorites without service data
          
          return (
          <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <Link href={`/services/${favorite.service.id}`}>
              <div className="relative h-48 bg-gray-200">
                {favorite.service.images && favorite.service.images[0] && (
                  <Image
                    src={favorite.service.images[0]}
                    alt={favorite.service.name}
                    fill
                    className="object-cover"
                  />
                )}
                {/* Heart icon to show it's favorited */}
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5">
                  <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{favorite.service.name}</h3>
                  {favorite.service.price_from && (
                    <span className="text-lg font-bold text-gray-900">₱{(favorite.service.price_from / 100).toFixed(0)}</span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{favorite.service.description}</p>
                
                {favorite.service.provider && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">by {favorite.service.provider.name}</span>
                    {favorite.service.provider.average_rating && (
                      <div className="flex items-center gap-1">
                        <StarRating rating={favorite.service.provider.average_rating} />
                        <span className="text-sm font-medium text-gray-900">
                          {favorite.service.provider.average_rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Saved {new Date(favorite.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          </div>
          );
        }).filter(Boolean)}
      </div>
    </div>
  );
}
