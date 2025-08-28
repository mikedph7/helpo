// SERVER COMPONENT
import { createServerApiClient, type HelpoCategory } from '@/lib/api-client';
import ServicesClient from './_components/services-client';

type PageProps = { 
  searchParams?: Promise<{ 
    q?: string; 
    category?: string;
    location?: string;
    date?: string;
    time?: string;
    sortBy?: string;
  }> 
};

export default async function ServicesPage({ searchParams }: PageProps) {
  const apiClient = await createServerApiClient();
  const params = await searchParams;
  
  try {
    // Build API parameters
    const apiParams: any = {};
    if (params?.q) apiParams.q = params.q;
    if (params?.category) apiParams.category = params.category as HelpoCategory;
    if (params?.location) apiParams.location = params.location;
    if (params?.sortBy) apiParams.sortBy = params.sortBy;
    
    // Fetch services using the API client
    const { services } = await apiClient.getServices(apiParams);
  
    const initialQ = (params?.q ?? '').toString();
    const initialCategory = (params?.category ?? '').toString();

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
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to load services:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load services</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }
}
