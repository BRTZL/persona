"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { ChatContent, ChatSidebar } from "@/components/chat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCharacter } from "@/lib/characters";

export default function NewChatPage({
  params,
}: {
  params: Promise<{ character: string }>;
}) {
  const { character: characterSlug } = use(params);
  const character = getCharacter(characterSlug);

  if (!character) {
    notFound();
  }

  return (
    <SidebarProvider>
      <ChatSidebar character={character} isNewChat />
      <SidebarInset>
        <ChatContent character={character} />
      </SidebarInset>
    </SidebarProvider>
  );
}
