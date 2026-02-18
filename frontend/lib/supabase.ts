import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Deal {
  id: number;
  product_name: string;
  description: string | null;
  category: string | null;
  original_price: number | null;
  sale_price: number;
  discount_percent: number | null;
  image_url: string | null;
  product_url: string;
  source: string; // Allow any source (reddit_*, steam, etc.)
  source_url: string | null;
  quality_score: number | null;
  expires_at: string | null;
  scraped_at: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
