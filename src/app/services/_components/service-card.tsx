'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Clock, CheckCircle, Star } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import type { Service as ApiService } from '@/lib/client-api';

// Re-export the Service type from API client for consistency
export type Service = ApiService;

// Category display names mapping
const getCategoryDisplayName = (category: string) => {
  const categoryNames: Record<string, string> = {
    'Cleaning': 'Home Care',
    'Repair': 'Fix It',
    'Pets': 'Pet Care', 
    'Lessons': 'Learn & Grow'
  };
  return categoryNames[category] || category;
};


export function ServiceCard({ service }: { service: Service }) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on a link or button
    if ((e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).closest('a')) {
      return;
    }
    router.push(`/services/${service.id}`);
  };

  // Get the main service image
  const serviceImage = service.images && service.images.length > 0 
    ? service.images[0] 
    : `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop`;

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        <Image
          src={serviceImage}
          alt={service.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {service.top_rated && (
            <Badge className="bg-yellow-500 text-white text-xs px-2 py-1 flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Top Rated
            </Badge>
          )}
          {service.verified && (
            <Badge className="bg-green-500 text-white text-xs px-2 py-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>

        {/* Price Badge */}
        {service.price_from && (
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-bold text-green-600">
              From ₱{service.price_from}
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {service.name}
          </h3>
          <p className="text-sm text-gray-500">{getCategoryDisplayName(service.category)}</p>
        </div>

        {/* Description */}
        {service.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {service.description}
          </p>
        )}

        {/* Provider Section */}
        {service.provider && (
          <div className="mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <a 
                href={`/providers/${service.provider.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {service.provider.name}
                {service.provider.verified && (
                  <CheckCircle className="h-3 w-3 text-blue-500" />
                )}
              </a>
              
              {service.provider.average_rating && (
                <div className="flex items-center gap-2">
                  <StarRating 
                    rating={service.provider.average_rating} 
                    size="sm" 
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {service.provider.average_rating.toFixed(1)}
                  </span>
                  {service.provider.rating_count && (
                    <span className="text-xs text-gray-500">
                      ({service.provider.rating_count})
                    </span>
                  )}
                </div>
              )}
            </div>

            {service.provider.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{service.provider.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          {service.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(service.duration_minutes / 60)}h {service.duration_minutes % 60}m</span>
            </div>
          )}
          
          {service.next_availability && (
            <div className="text-xs text-green-600 font-medium">
              Available: {service.next_availability}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
