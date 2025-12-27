"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CharacterAvatar } from "@/components/character-avatar";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCommandDialog } from "@/hooks/use-command-dialog";
import { getAllCharacters, getCharacter } from "@/lib/characters";
import { conversationsQueryOptions } from "@/queries";

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function SearchCommandDialog() {
  const router = useRouter();
  const { isOpen, setOpen } = useCommandDialog();
  const characters = getAllCharacters();
  const { data: conversations = [] } = useQuery(conversationsQueryOptions());

  const handleCharacterSelect = (slug: string) => {
    setOpen(false);
    router.push(`/chat?character=${slug}`);
  };

  const handleConversationSelect = (conversationId: string) => {
    setOpen(false);
    router.push(`/chat/${conversationId}`);
  };

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setOpen}
      title="Search"
      description="Search for characters or conversations"
    >
      <Command>
        <CommandInput placeholder="Search characters & conversations..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Characters">
            {characters.map((character) => (
              <CommandItem
                key={character.slug}
                value={`character-${character.slug}-${character.name}-${character.description}`}
                onSelect={() => handleCharacterSelect(character.slug)}
              >
                <CharacterAvatar slug={character.slug} size="sm" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{character.name}</span>
                  <span className="text-muted-foreground line-clamp-1 text-[10px]">
                    {character.description}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          {conversations.length > 0 && (
            <CommandGroup heading="Conversations">
              {conversations.slice(0, 10).map((conversation) => {
                const character = getCharacter(conversation.character_slug);
                return (
                  <CommandItem
                    key={conversation.id}
                    value={`conversation-${conversation.id}-${conversation.title ?? ""}-${character?.name ?? ""}`}
                    onSelect={() => handleConversationSelect(conversation.id)}
                  >
                    <CharacterAvatar
                      slug={conversation.character_slug}
                      size="sm"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {conversation.title ?? "New conversation"}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {character?.name ?? "Unknown"} ·{" "}
                        {formatRelativeTime(conversation.updated_at)}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
