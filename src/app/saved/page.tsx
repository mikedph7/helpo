import { createServerApiClient, type Favorite as ApiFavorite } from "@/lib/api-client";
// This page uses server-only APIs (headers) and must be rendered dynamically.
export const dynamic = 'force-dynamic';
import SavedServicesList from './_components/saved-services-list';

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

export default async function SavedPage() {
  const favorites = await getFavorites();

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
      <SavedServicesList initialFavorites={favorites} />
    </div>
  );
}
