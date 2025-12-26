"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChatContent, ChatSidebar } from "@/components/chat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCharacter } from "@/lib/characters";
import { conversationQueryOptions } from "@/queries";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: conversation, isLoading } = useQuery(
    conversationQueryOptions(id)
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading conversation...</div>
      </div>
    );
  }

  if (!conversation) {
    notFound();
  }

  const character = getCharacter(conversation.character_slug);

  if (!character) {
    notFound();
  }

  return (
    <SidebarProvider>
      <ChatSidebar character={character} currentConversationId={id} />
      <SidebarInset>
        <ChatContent
          character={character}
          conversationId={id}
          initialMessages={conversation.messages}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
