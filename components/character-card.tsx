"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { CharacterAvatar } from "@/components/character-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Character, CharacterSlug } from "@/lib/characters";
import { cn } from "@/lib/utils";
import { useFavoriteCharacters, useToggleFavoriteCharacter } from "@/queries";

type CharacterCardProps = {
  character: Character;
};

export function CharacterCard({ character }: CharacterCardProps) {
  const { isFavorite } = useFavoriteCharacters();
  const toggleFavorite = useToggleFavoriteCharacter();

  const isFav = isFavorite(character.slug as CharacterSlug);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleFavorite.mutate(
      { slug: character.slug as CharacterSlug, isFavorite: isFav },
      {
        onSuccess: () => {
          toast.success(
            isFav
              ? `Removed ${character.name} from favorites`
              : `Added ${character.name} to favorites`
          );
        },
        onError: () => {
          toast.error("Failed to update favorites");
        },
      }
    );
  };

  return (
    <Link href={`/chat?character=${character.slug}`}>
      <Card className="group hover:border-primary/50 relative h-full cursor-pointer p-4 transition-all hover:shadow-md">
        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 size-8 opacity-0 transition-opacity group-hover:opacity-100",
            isFav && "opacity-100"
          )}
          onClick={handleToggleFavorite}
          disabled={toggleFavorite.isPending}
        >
          <Star
            className={cn(
              "size-4 transition-colors",
              isFav
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground hover:text-amber-400"
            )}
          />
        </Button>

        <div className="flex flex-col items-center text-center">
          <div className="ring-border group-hover:ring-primary/50 mb-3 rounded-full ring-2 ring-offset-2 transition-all">
            <CharacterAvatar slug={character.slug} size="xl" />
          </div>
          <h3 className="mb-1 font-semibold">{character.name}</h3>
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {character.description}
          </p>
        </div>
      </Card>
    </Link>
  );
}
