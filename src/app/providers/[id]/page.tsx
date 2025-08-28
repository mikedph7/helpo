import { createServerApiClient, type Provider } from "@/lib/api-client";

async function getProvider(id: string): Promise<Provider | null> {
  try {
    const apiClient = await createServerApiClient();
    return await apiClient.getProvider(parseInt(id));
  } catch (error) {
    console.error('Failed to fetch provider:', error);
    return null;
  }
}

export default async function ProviderPage({ params }: { params: { id: string } }) {
  const p = await getProvider(params.id);
  if (!p) return <div className="text-red-600">Provider not found.</div>;
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">{p.name}</h1>
      <p className="text-sm text-gray-600">{p.average_rating ? `${p.average_rating}★` : "—"} ({p.rating_count ?? 0})</p>
      <a href="/services" className="text-blue-600 text-sm">← Back to services</a>
    </section>
  );
}
