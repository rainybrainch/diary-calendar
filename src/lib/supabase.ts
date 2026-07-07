import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or anon key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getImageUrl = (bucketName: string, imagePath: string) => {
  if (!imagePath) return null;
  return supabase.storage.from(bucketName).getPublicUrl(imagePath).data.publicUrl;
};

export const uploadImage = async (bucketName: string, imagePath: string, imageData: Blob) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(imagePath, imageData, { upsert: true });

  if (error) throw error;
  return data;
};

export const deleteImage = async (bucketName: string, imagePath: string) => {
  const { error } = await supabase.storage.from(bucketName).remove([imagePath]);
  if (error) throw error;
};
