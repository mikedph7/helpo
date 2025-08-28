import Link from "next/link";
import Image from "next/image";
import React from "react";
import { createServerApiClient, type Service as ApiService, type Review as ApiReview, type Provider as ApiProvider } from "@/lib/api-client";
import PhotoCarousel from "./_components/photo-carousel";
import FavoriteButton from "./_components/favorite-button";
import { ArrowLeft } from "lucide-react";

// Use the API types directly
type Review = ApiReview;
type Provider = ApiProvider;
type Service = ApiService;

async function getService(id: string): Promise<Service | null> {
  try {
    const apiClient = await createServerApiClient();
    return await apiClient.getService(parseInt(id));
  } catch (error) {
    console.error('Failed to fetch service:', error);
    return null;
  }
}

function StarRating({ rating, showNumber = false }: { rating: number; showNumber?: boolean }) {
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
      {showNumber && <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
}

export default async function ServiceDetail({ params }: { params: { id: string } }) {
  const service = await getService(params.id);
  
  if (!service) {
    return (
      <div className="min-h-screen bg-white">
        {/* Sub Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center space-x-3">
              <Link 
                href="/services"
                className="text-gray-600 hover:text-gray-900 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Service Not Found</h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h1>
            <p className="text-gray-600 mb-4">The service you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = service.stats?.average_rating 
    ? service.stats.average_rating 
    : service.provider?.average_rating || 0;

  const reviewCount = service.stats?.review_count || service.provider?.rating_count || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Sub Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link 
                href="/services"
                className="text-gray-600 hover:text-gray-900 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Service Details</h1>
                <p className="text-sm text-gray-600 truncate max-w-[200px] sm:max-w-none">
                  {service.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {service.price_from ? `₱${(service.price_from / 100).toFixed(0)}` : 'Price on request'}
              </p>
              <p className="text-xs text-gray-500">starting price</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header / Hero Section */}
        <div className="mb-6 relative">
          <PhotoCarousel images={service.images || []} />
          {/* Heart/Favorite Icon */}
          <FavoriteButton serviceId={service.id.toString()} />
        </div>

        {/* Basic Info */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{service.name}</h1>
                <div className="flex items-center gap-2">
                  {service.top_rated && (
                    <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      Top Rated
                    </span>
                  )}
                  {service.verified && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={averageRating} showNumber />
                <span className="text-sm text-gray-600">({reviewCount} reviews)</span>
              </div>
            </div>
            
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-gray-900">₱{service.price_from}</div>
              <div className="text-sm text-gray-500">starting price</div>
            </div>
          </div>

          {/* Provider Info */}
          {service.provider && (
            <Link 
              href={`/providers/${service.provider.id}`}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {service.provider.photo_url && (
                  <Image
                    src={service.provider.photo_url}
                    alt={service.provider.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{service.provider.name}</h3>
                  {service.provider.verified && (
                    <span className="text-blue-600 text-sm">✓</span>
                  )}
                </div>
                {service.provider.location && (
                  <p className="text-sm text-gray-600 mb-1">{service.provider.location}</p>
                )}
                <p className="text-sm text-gray-500">5 years in service</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Details */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About this service</h2>
          <p className="text-gray-700 leading-relaxed mb-6">{service.description}</p>

          {service.what_included && service.what_included.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What's included</h3>
              <ul className="space-y-2">
                {service.what_included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Rules / Requirements */}
        {service.requirements && service.requirements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements & Rules</h2>
            <ul className="space-y-2">
              {service.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reviews */}
        {service.reviews && service.reviews.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} showNumber />
                <span className="text-sm text-gray-600">({reviewCount} reviews)</span>
              </div>
            </div>

            <div className="space-y-6">
              {service.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {review.user?.photo_url && (
                        <Image
                          src={review.user.photo_url}
                          alt={review.user.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</h4>
                        <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <StarRating rating={review.rating} />
                      {review.comment && (
                        <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Call to Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-900">
              {service.price_from ? `₱${(service.price_from / 100).toFixed(0)} starting price` : 'Contact for pricing'}
            </div>
            {service.next_availability && (
              <div className="text-sm text-gray-600">Next available: {service.next_availability}</div>
            )}
          </div>
          <Link 
            href={`/bookings/new/${service.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center w-full sm:w-auto"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
