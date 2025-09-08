// API Client for Helpo App
// Centralized client for all API endpoints with proper TypeScript types

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type HelpoCategory = 'Cleaning' | 'Repair' | 'Pets' | 'Lessons';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: number;
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  bio?: string;
  location?: string;
  average_rating: number;
  rating_count: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
  services?: Service[];
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  category: HelpoCategory;
  price_from?: number;
  duration_minutes?: number;
  what_included?: string[];
  requirements?: string[];
  images?: string[];
  top_rated: boolean;
  verified: boolean;
  next_availability?: string;
  provider_id: number;
  created_at: string;
  updated_at: string;
  provider?: Provider;
  reviews?: Review[];
  stats?: {
    booking_count: number;
    favorite_count: number;
    review_count: number;
    average_rating: number;
  };
}

export interface Booking {
  id: number;
  user_id: number;
  service_id: number;
  provider_id: number;
  scheduled_at: string;
  location?: string;
  notes?: string;
  number_of_people: number;
  status: BookingStatus;
  total_price?: number;
  payment_method_id?: string;
  created_at: string;
  updated_at: string;
  service?: Service;
  provider?: Provider;
  user?: User;
}

export interface Favorite {
  id: number;
  user_id: number;
  service_id: number;
  created_at: string;
  service?: Service;
  user?: User;
}

export interface Review {
  id: number;
  user_id: number;
  service_id: number;
  booking_id?: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  service?: Service;
  booking?: Booking;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ServicesResponse {
  services: Service[];
  count: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface ProvidersResponse {
  providers: Provider[];
  count: number;
}

export interface BookingsResponse {
  bookings: Booking[];
  count: number;
}

export interface FavoritesResponse {
  favorites: Favorite[];
  count: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  count: number;
  average_rating: number;
}

export interface SearchAnalyticsResponse {
  total_searches: number;
  popular_terms: Array<{ term: string; count: number; }>;
  category_distribution: Record<HelpoCategory, number>;
  average_response_time: number;
}

export interface SearchSuggestionsResponse {
  suggestions: string[];
}

export interface PopularSearchesResponse {
  popular_searches: Array<{ term: string; count: number; }>;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class HelpoApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '';
  }

  // Helper method to build URL with query params
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = `${this.baseUrl}/api/dev${endpoint}`;
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  // Generic fetch method with error handling
  private async fetchApi<T>(endpoint: string, options?: RequestInit, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ============================================================================
  // SERVICES API
  // ============================================================================

  async getServices(params?: {
    q?: string;
    category?: HelpoCategory;
    location?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
  }): Promise<ServicesResponse> {
    return this.fetchApi<ServicesResponse>('/services', { cache: 'no-store' }, params);
  }

  async getService(id: number | string): Promise<Service> {
    return this.fetchApi<Service>(`/services/${id}`, { cache: 'no-store' });
  }

  // ============================================================================
  // PROVIDERS API
  // ============================================================================

  async getProviders(): Promise<Provider[]> {
    const response = await this.fetchApi<Provider[]>('/providers', { cache: 'no-store' });
    return response;
  }

  async getProvider(id: number | string): Promise<Provider> {
    return this.fetchApi<Provider>(`/providers/${id}`, { cache: 'no-store' });
  }

  // ============================================================================
  // BOOKINGS API
  // ============================================================================

  async getBookings(params?: {
    user_id?: number;
    service_id?: number;
    provider_id?: number;
    status?: BookingStatus;
  }): Promise<BookingsResponse> {
    return this.fetchApi<BookingsResponse>('/bookings', { cache: 'no-store' }, params);
  }

  async getBooking(id: number | string): Promise<Booking> {
    return this.fetchApi<Booking>(`/bookings/${id}`, { cache: 'no-store' });
  }

  async getBookingDetails(params: { booking_id?: number | string } | { id?: number | string }): Promise<Booking> {
    if ('booking_id' in params && params.booking_id) {
      return this.fetchApi<Booking>('/bookings/details', { cache: 'no-store' }, { booking_id: params.booking_id });
    } else if ('id' in params && params.id) {
      return this.fetchApi<Booking>(`/bookings/details/${params.id}`, { cache: 'no-store' });
    }
    throw new Error('Either booking_id or id parameter is required');
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    return this.fetchApi<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async updateBooking(id: number | string, booking: Partial<Booking>): Promise<Booking> {
    return this.fetchApi<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(booking),
    });
  }

  async cancelBooking(
    id: number | string, 
    cancellationReason: string, 
    cancellationDetails?: string
  ): Promise<Booking> {
    return this.fetchApi<Booking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        status: 'cancelled',
        cancellation_reason: cancellationReason,
        cancellation_details: cancellationDetails
      }),
    });
  }

  // ============================================================================
  // FAVORITES API
  // ============================================================================

  async getFavorites(params?: {
    user_id?: number;
    service_id?: number;
  }): Promise<FavoritesResponse> {
    return this.fetchApi<FavoritesResponse>('/favorites', { cache: 'no-store' }, params);
  }

  async addFavorite(userId: number, serviceId: number): Promise<Favorite> {
    return this.fetchApi<Favorite>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, service_id: serviceId }),
    });
  }

  async removeFavorite(userId: number, serviceId: number): Promise<{ success: boolean }> {
    return this.fetchApi<{ success: boolean }>('/favorites', {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId, service_id: serviceId }),
    });
  }

  // ============================================================================
  // REVIEWS API
  // ============================================================================

  async getReviews(params?: {
    service_id?: number;
    user_id?: number;
    booking_id?: number;
  }): Promise<ReviewsResponse> {
    return this.fetchApi<ReviewsResponse>('/reviews', { cache: 'no-store' }, params);
  }

  async createReview(review: Partial<Review>): Promise<Review> {
    return this.fetchApi<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  // ============================================================================
  // USERS API
  // ============================================================================

  async getUser(id: number | string): Promise<User> {
    return this.fetchApi<User>(`/users/${id}`, { cache: 'no-store' });
  }

  // ============================================================================
  // SEARCH API
  // ============================================================================

  async getSearchAnalytics(): Promise<SearchAnalyticsResponse> {
    return this.fetchApi<SearchAnalyticsResponse>('/search/analytics', { cache: 'no-store' });
  }

  async getSearchSuggestions(params?: { q?: string }): Promise<SearchSuggestionsResponse> {
    return this.fetchApi<SearchSuggestionsResponse>('/search/suggestions', { cache: 'no-store' }, params);
  }

  async getPopularSearches(): Promise<PopularSearchesResponse> {
    return this.fetchApi<PopularSearchesResponse>('/search/popular', { cache: 'no-store' });
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

// For server-side components
export async function createServerApiClient(): Promise<HelpoApiClient> {
  // For now, return client API since we've moved to client-side rendering
  // This prevents build errors when not using server-side features
  return new HelpoApiClient();
}

// For client-side components
export function createClientApiClient(): HelpoApiClient {
  return new HelpoApiClient();
}

// Default export for convenience
export default HelpoApiClient;
