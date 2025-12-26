import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CharacterSlug } from "@/lib/characters";
import { createClient } from "@/lib/supabase/client";

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { onboarding_completed: true },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useUpdateDisplayName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (displayName: string) => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useSignOutOtherSessions() {
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) {
        throw error;
      }
    },
  });
}

export const favoriteCharactersQueryOptions = {
  queryKey: ["favorite-characters"] as const,
  queryFn: async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("favorite_characters")
      .select("character_slug")
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }
    return data.map((f) => f.character_slug as CharacterSlug);
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
};

export function useFavoriteCharacters() {
  const { data: favorites = [], isLoading } = useQuery(
    favoriteCharactersQueryOptions
  );

  return {
    favorites,
    isLoading,
    isFavorite: (slug: CharacterSlug) => favorites.includes(slug),
  };
}

export function useToggleFavoriteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      isFavorite,
    }: {
      slug: CharacterSlug;
      isFavorite: boolean;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorite_characters")
          .delete()
          .eq("user_id", user.id)
          .eq("character_slug", slug);

        if (error) {
          throw error;
        }
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorite_characters").insert({
          user_id: user.id,
          character_slug: slug,
        });

        if (error) {
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-characters"] });
    },
  });
}
