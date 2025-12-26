"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { toast } from "sonner";
import { CharacterAvatar } from "@/components/character-avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type Character,
  type CharacterSlug,
  getAllCharacters,
} from "@/lib/characters";
import { cn } from "@/lib/utils";
import { useFavoriteCharacters, useToggleFavoriteCharacter } from "@/queries";

type CharacterSelectorProps = {
  selectedCharacter: Character | null;
  onSelect: (slug: string) => void;
};

export function CharacterSelector({
  selectedCharacter,
  onSelect,
}: CharacterSelectorProps) {
  const [open, setOpen] = useState(false);
  const allCharacters = getAllCharacters();
  const { isFavorite, isLoading: isFavoritesLoading } = useFavoriteCharacters();
  const toggleFavorite = useToggleFavoriteCharacter();

  // Sort characters: favorites first, then alphabetically
  const sortedCharacters = [...allCharacters].sort((a, b) => {
    if (isFavoritesLoading) return 0;
    const aFav = isFavorite(a.slug as CharacterSlug);
    const bFav = isFavorite(b.slug as CharacterSlug);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleToggleFavorite = (
    e: React.MouseEvent,
    char: Character,
    isCharFavorite: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate(
      { slug: char.slug as CharacterSlug, isFavorite: isCharFavorite },
      {
        onSuccess: () => {
          toast.success(
            isCharFavorite
              ? `Removed ${char.name} from favorites`
              : `Added ${char.name} to favorites`
          );
        },
        onError: () => {
          toast.error("Failed to update favorites");
        },
      }
    );
  };

  const handleSelect = (slug: string) => {
    onSelect(slug);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-full px-3"
        >
          {selectedCharacter ? (
            <>
              <CharacterAvatar slug={selectedCharacter.slug} size="xs" />
              <span className="text-xs">{selectedCharacter.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-xs">
              Select persona
            </span>
          )}
          <ChevronDown className="size-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="top">
        <Command>
          <CommandList className="max-h-80">
            <CommandGroup className="p-1">
              {sortedCharacters.map((char) => {
                const isCharFavorite = isFavorite(char.slug as CharacterSlug);
                const isSelected = selectedCharacter?.slug === char.slug;
                return (
                  <CommandItem
                    key={char.slug}
                    value={char.slug}
                    onSelect={() => handleSelect(char.slug)}
                    className={cn(
                      "group flex items-start gap-2.5 px-2 py-2",
                      isSelected && "bg-muted"
                    )}
                  >
                    <CharacterAvatar slug={char.slug} size="md" />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-medium">{char.name}</span>
                      <span className="text-muted-foreground line-clamp-2 text-xs">
                        {char.description}
                      </span>
                    </div>
                    <button
                      onClick={(e) =>
                        handleToggleFavorite(e, char, isCharFavorite)
                      }
                      className={cn(
                        "mt-0.5 shrink-0 rounded p-1 transition-colors hover:text-amber-400",
                        isCharFavorite
                          ? "text-amber-400"
                          : "text-muted-foreground opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Star
                        className={cn(
                          "size-4",
                          isCharFavorite && "fill-amber-400"
                        )}
                      />
                    </button>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
