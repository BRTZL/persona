"use client";

import { Sparkles } from "lucide-react";
import { CharacterAvatar } from "@/components/character-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Character } from "@/lib/characters";

type ChatHeaderProps = {
  character: Character | null;
  hasStartedChat: boolean;
};

export function ChatHeader({ character, hasStartedChat }: ChatHeaderProps) {
  const showCharacterInfo = character && hasStartedChat;

  return (
    <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-3">
        {showCharacterInfo ? (
          <>
            <CharacterAvatar slug={character.slug} size="md" />
            <div>
              <div className="text-foreground font-medium">
                {character.name}
              </div>
              <div className="text-muted-foreground text-xs">
                {character.description}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-full">
              <Sparkles className="text-primary size-4" />
            </div>
            <div className="text-foreground font-medium">New Chat</div>
          </>
        )}
      </div>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
