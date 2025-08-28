export type Provider = {
  id: string;
  display_name: string;
  photo_url?: string;
  rating_avg?: number;
  rating_count?: number;
};

export type Service = {
  id: string;
  provider_id: string;
  title: string;
  category: string;
  description?: string;
  base_price_cents: number;
  is_active: boolean;
  photos?: string[];
};
