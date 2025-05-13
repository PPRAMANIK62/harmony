import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string(),
  VITE_SPOTIFY_CLIENT_ID: z.string(),
  VITE_SPOTIFY_REDIRECT_URI: z.string().url(),
});

export const env = envSchema.parse(import.meta.env);
