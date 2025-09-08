"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientApiClient, type HelpoCategory, type Service } from '@/lib/api-client';
import ServicesClient from './_components/services-client';
import { LoadingPage, LoadingGrid } from '@/components/ui/loading';

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const apiClient = createClientApiClient();
        
        // Build API parameters from search params
        const apiParams: any = {};
        const q = searchParams.get('q');
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const date = searchParams.get('date');
        const time = searchParams.get('time');
        const sortBy = searchParams.get('sortBy');
        
        if (q) apiParams.q = q;
        if (category) apiParams.category = category as HelpoCategory;
        if (location) apiParams.location = location;
        if (date) apiParams.date = date;
        if (time) apiParams.time = time;
        if (sortBy) apiParams.sortBy = sortBy;
        
        // Fetch services using the API client
        const { services } = await apiClient.getServices(apiParams);
        setServices(services);
      } catch (error) {
        console.error('Failed to load services:', error);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [searchParams]);

  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialLocation = searchParams.get('location') || '';
  const initialDate = searchParams.get('date') || '';
  const initialTime = searchParams.get('time') || '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Find the right help, right away.
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with trusted professionals for home care, repairs, pet services, and learning
            </p>
          </div>
          
          {/* Loading State */}
          <LoadingPage 
            title="Loading Services" 
            message="Finding the best services for you..."
          />
          
          {/* Skeleton Grid */}
          <LoadingGrid count={8} className="mt-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Find the right help, right away.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with trusted professionals for home care, repairs, pet services, and learning
          </p>
        </div>

        <ServicesClient
          services={services}
          initialQ={initialQ}
          initialCategory={initialCategory}
          initialLocation={initialLocation}
          initialDate={initialDate}
          initialTime={initialTime}
        />
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Find the right help, right away.
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with trusted professionals for home care, repairs, pet services, and learning
            </p>
          </div>
          
          {/* Loading State */}
          <LoadingPage 
            title="Loading Services" 
            message="Preparing the services page..."
          />
          
          {/* Skeleton Grid */}
          <LoadingGrid count={8} className="mt-8" />
        </div>
      </div>
    }>
      <ServicesPageContent />
    </Suspense>
  );
}
