import { useMutation } from "@tanstack/react-query";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

export function useGoogleLogin() {
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });
      if (error) {
        throw error;
      }
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      window.location.href = "/";
    },
  });
}
