"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  type Character,
  getAllCharacters,
  getCharacter,
} from "@/lib/characters";
import { conversationsQueryOptions } from "@/queries";

type ChatSidebarProps = {
  character?: Character;
  currentConversationId?: string;
  isNewChat?: boolean; // true when on /chat/new/[character] page
};

function groupConversationsByDate(
  conversations: Array<{
    id: string;
    title: string | null;
    updated_at: string | null;
    character_slug: string;
  }>
) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groups: Record<string, typeof conversations> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    "Last 30 days": [],
    Older: [],
  };

  for (const conv of conversations) {
    const date = conv.updated_at ? new Date(conv.updated_at) : new Date();

    if (date >= today) {
      groups["Today"].push(conv);
    } else if (date >= yesterday) {
      groups["Yesterday"].push(conv);
    } else if (date >= lastWeek) {
      groups["Last 7 days"].push(conv);
    } else if (date >= lastMonth) {
      groups["Last 30 days"].push(conv);
    } else {
      groups["Older"].push(conv);
    }
  }

  return Object.entries(groups).filter(([, convs]) => convs.length > 0);
}

export function ChatSidebar({
  character,
  currentConversationId,
  isNewChat = false,
}: ChatSidebarProps) {
  const allCharacters = getAllCharacters();
  const { data: conversations = [] } = useQuery(conversationsQueryOptions());

  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
        <Link href="/" className="flex flex-row items-center gap-2 px-2">
          <div className="bg-primary/10 flex size-8 items-center justify-center rounded-md">
            <Sparkles className="text-primary size-4" />
          </div>
          <div className="text-md font-base text-primary tracking-tight">
            Persona
          </div>
        </Link>
        <Button variant="ghost" className="size-8">
          <Search className="size-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <div className="px-4">
          <Button
            variant="outline"
            className="mb-4 flex w-full items-center gap-2"
            asChild
          >
            <Link href="/chat/new">
              <PlusIcon className="size-4" />
              <span>New Chat</span>
            </Link>
          </Button>
        </div>

        {/* Character selector */}
        <SidebarGroup>
          <SidebarGroupLabel>Switch Character</SidebarGroupLabel>
          <SidebarMenu>
            {allCharacters.map((char) => (
              <SidebarMenuButton
                key={char.slug}
                asChild
                isActive={isNewChat && char.slug === character?.slug}
              >
                <Link
                  href={`/chat/new/${char.slug}`}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={char.avatarUrl}
                    alt={char.name}
                    width={24}
                    height={24}
                    className="size-6 rounded-full"
                  />
                  <span>{char.name}</span>
                </Link>
              </SidebarMenuButton>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Conversation history */}
        {groupedConversations.map(([period, convs]) => (
          <SidebarGroup key={period}>
            <SidebarGroupLabel>{period}</SidebarGroupLabel>
            <SidebarMenu>
              {convs.map((conversation) => {
                const convCharacter = getCharacter(conversation.character_slug);
                return (
                  <SidebarMenuButton
                    key={conversation.id}
                    asChild
                    isActive={conversation.id === currentConversationId}
                  >
                    <Link
                      href={`/chat/${conversation.id}`}
                      className="flex items-center gap-2"
                    >
                      {convCharacter && (
                        <Image
                          src={convCharacter.avatarUrl}
                          alt={convCharacter.name}
                          width={20}
                          height={20}
                          className="size-5 rounded-full"
                        />
                      )}
                      <span className="truncate">
                        {conversation.title ?? "New conversation"}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
