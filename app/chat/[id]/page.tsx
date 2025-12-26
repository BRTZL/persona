"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChatContent,
  ChatContentSkeleton,
  ChatSidebar,
} from "@/components/chat";
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

  // Get character from conversation
  const character = conversation
    ? getCharacter(conversation.character_slug)
    : null;

  // Show skeleton while loading
  if (isLoading || !conversation) {
    return (
      <SidebarProvider>
        <ChatSidebar currentConversationId={id} />
        <SidebarInset>
          <ChatContentSkeleton />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!character) {
    notFound();
  }

  return (
    <SidebarProvider>
      <ChatSidebar currentConversationId={id} />
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
