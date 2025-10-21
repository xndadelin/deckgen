
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        async getAll() {
          const resolvedCookies = await cookieStore;
          return resolvedCookies.getAll();
        },
        async setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            const resolvedCookies = await cookieStore;
            cookiesToSet.forEach(({ name, value, options }) => resolvedCookies.set(name, value, options));
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
