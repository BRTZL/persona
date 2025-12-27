"use client";

import { Sparkles, Star } from "lucide-react";
import { CharacterAvatar } from "@/components/character-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Character,
  type CharacterSlug,
  getAllCharacters,
} from "@/lib/characters";
import { cn } from "@/lib/utils";
import { useFavoriteCharacters } from "@/queries";

type ChatWelcomeProps = {
  character: Character | null;
  onCharacterSelect: (slug: string) => void;
  onKickstartSelect: (message: string) => void;
};

export function ChatWelcome({
  character,
  onCharacterSelect,
  onKickstartSelect,
}: ChatWelcomeProps) {
  const allCharacters = getAllCharacters();
  const { isFavorite, isLoading: isFavoritesLoading } = useFavoriteCharacters();

  // Sort characters: favorites first, then alphabetically
  const sortedCharacters = [...allCharacters].sort((a, b) => {
    if (isFavoritesLoading) return 0;
    const aFav = isFavorite(a.slug as CharacterSlug);
    const bFav = isFavorite(b.slug as CharacterSlug);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.name.localeCompare(b.name);
  });

  if (!character) {
    // No character selected - show all characters with descriptions
    return (
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-8 md:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
              <Sparkles className="text-primary size-7" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">
              Choose a persona to chat with
            </h2>
            <p className="text-muted-foreground">
              Each persona has a unique personality and expertise
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isFavoritesLoading
              ? // Show skeleton while loading favorites
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex h-full flex-col items-start gap-3 rounded-xl border p-4"
                  >
                    <div className="flex w-full items-start gap-3">
                      <Skeleton className="size-12 shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                    <Skeleton className="mt-auto h-10 w-full rounded-lg" />
                  </div>
                ))
              : sortedCharacters.map((char) => {
                  const isCharFavorite = isFavorite(char.slug as CharacterSlug);
                  return (
                    <button
                      key={char.slug}
                      onClick={() => onCharacterSelect(char.slug)}
                      className={cn(
                        "group relative flex h-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all",
                        "hover:border-primary/50 hover:bg-muted/50",
                        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
                      )}
                    >
                      {isCharFavorite && (
                        <Star className="absolute top-3 right-3 size-4 fill-amber-400 text-amber-400" />
                      )}
                      <div className="flex items-start gap-3">
                        <CharacterAvatar slug={char.slug} size="lg" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold">{char.name}</h3>
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {char.description}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground border-muted bg-muted/30 mt-auto w-full rounded-lg border px-3 py-2 text-sm italic">
                        &ldquo;{char.kickstartMessages[0]}&rdquo;
                      </p>
                    </button>
                  );
                })}
          </div>
        </div>
      </div>
    );
  }

  // Character selected - show character info and kickstart messages
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <CharacterAvatar slug={character.slug} size="xl" className="mb-4" />
      <h2 className="mb-2 text-xl font-semibold">{character.name}</h2>
      <p className="text-muted-foreground mb-6 max-w-md text-center">
        {character.description}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {character.kickstartMessages.slice(0, 4).map((msg, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto px-4 py-3 text-left whitespace-normal"
            onClick={() => onKickstartSelect(msg)}
          >
            {msg}
          </Button>
        ))}
      </div>
    </div>
  );
}
