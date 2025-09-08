"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClientApiClient, type Provider } from "@/lib/api-client";
import { LoadingPage } from "@/components/ui/loading";

export default function ProviderPage() {
  const params = useParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        const apiClient = createClientApiClient();
        const providerData = await apiClient.getProvider(parseInt(params.id as string));
        setProvider(providerData);
      } catch (error) {
        console.error('Failed to fetch provider:', error);
        setError('Failed to load provider');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, [params.id]);

  if (isLoading) {
    return <LoadingPage title="Loading Provider" message="Fetching provider information..." />;
  }

  if (error || !provider) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Provider not found</h1>
        <p className="text-gray-600 mb-4">The provider you're looking for doesn't exist or couldn't be loaded.</p>
        <a href="/services" className="text-blue-600 hover:underline">← Back to services</a>
      </div>
    );
  }

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">{provider.name}</h1>
      <p className="text-sm text-gray-600">
        {provider.average_rating ? `${provider.average_rating}★` : "—"} ({provider.rating_count ?? 0})
      </p>
      <a href="/services" className="text-blue-600 text-sm hover:underline">← Back to services</a>
    </section>
  );
}
