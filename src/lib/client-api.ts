// Client-only API Client for Helpo App
// This version doesn't import any server-side code and is safe for client components

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type HelpoCategory = 'Cleaning' | 'Repair' | 'Pets' | 'Lessons';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'canceled';

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
  average_rating?: number;
  rating_count?: number;
  hourly_rate?: number;
  work_days?: number[];
  blocked_dates?: string[];
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  provider_id: number;
  name: string;
  category: HelpoCategory;
  description?: string;
  price_from?: number;
  duration_minutes?: number;
  images?: string[];
  location?: string;
  available: boolean;
  top_rated?: boolean;
  verified?: boolean;
  next_availability?: string;
  created_at: string;
  updated_at: string;
  provider?: Provider;
}

export interface Booking {
  id?: number;
  user_id?: number;
  provider_id?: number;
  service_id?: number;
  scheduled_at?: string;
  location?: string;
  status?: BookingStatus;
  total_price?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  service?: Service;
  user?: User;
}

// ============================================================================
// CLIENT API CLASS
// ============================================================================

export class ClientApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    // For client-side, use relative URLs (empty baseUrl)
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/api/dev${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ============================================================================
  // BOOKING ENDPOINTS
  // ============================================================================

  async getBooking(id: number | string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async updateBooking(id: number | string, booking: Partial<Booking>): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(booking),
    });
  }

  async cancelBooking(
    id: number | string, 
    cancellationReason: string, 
    cancellationDetails?: string
  ): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({
        cancellation_reason: cancellationReason,
        cancellation_details: cancellationDetails
      }),
    });
  }

  // ============================================================================
  // SERVICE ENDPOINTS
  // ============================================================================

  async getServices(params?: {
    category?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<Service[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return this.request<Service[]>(`/services${query ? `?${query}` : ''}`);
  }

  async getService(id: number | string): Promise<Service> {
    return this.request<Service>(`/services/${id}`);
  }

  // ============================================================================
  // PROVIDER ENDPOINTS
  // ============================================================================

  async getProviders(params?: {
    category?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<Provider[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return this.request<Provider[]>(`/providers${query ? `?${query}` : ''}`);
  }

  async getProvider(id: number | string): Promise<Provider> {
    return this.request<Provider>(`/providers/${id}`);
  }

  // Get provider availability for a specific date
  async getProviderAvailability(providerId: number | string, date: string): Promise<{
    provider_id: number;
    date: string;
    available_dates: string[];
    time_slots: Array<{
      id: string;
      label: string;
      start_time: string;
      end_time: string;
      available: boolean;
      period: 'morning' | 'noon' | 'afternoon';
    }>;
  }> {
    return this.request<any>(`/providers/${providerId}/availability?date=${date}`);
  }
}
