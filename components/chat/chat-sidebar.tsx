"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsRestoring, useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  PlusIcon,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { CharacterAvatar } from "@/components/character-avatar";
import { UsageIndicator } from "@/components/chat/usage-indicator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { type CharacterSlug, getAllCharacters } from "@/lib/characters";
import {
  conversationsQueryOptions,
  useDeleteConversation,
  useFavoriteCharacters,
  useUser,
} from "@/queries";

type ChatSidebarProps = {
  currentConversationId?: string;
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

export function ChatSidebar({ currentConversationId }: ChatSidebarProps) {
  const router = useRouter();
  const allCharacters = getAllCharacters();
  const isRestoring = useIsRestoring();
  const { data: conversations = [], isPending: isConversationsPending } =
    useQuery(conversationsQueryOptions());
  const { data: user } = useUser();
  const { favorites, isLoading: isFavoritesLoading } = useFavoriteCharacters();
  const deleteConversation = useDeleteConversation();

  // Show loading state when either fetching OR restoring cache
  const isConversationsLoading = isConversationsPending || isRestoring;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<{
    id: string;
    title: string | null;
  } | null>(null);

  const handleDeleteClick = (
    e: React.MouseEvent,
    conversation: { id: string; title: string | null }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!conversationToDelete) return;

    deleteConversation.mutate(conversationToDelete.id, {
      onSuccess: () => {
        toast.success("Conversation deleted");
        setDeleteDialogOpen(false);
        setConversationToDelete(null);
        // If we're viewing the deleted conversation, navigate away
        if (currentConversationId === conversationToDelete.id) {
          router.push("/chat");
        }
      },
      onError: () => {
        toast.error("Failed to delete conversation");
      },
    });
  };

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "User";
  const avatarInitial = displayName[0]?.toUpperCase() ?? "U";

  // Get favorite characters
  const favoriteCharacters = allCharacters.filter((char) =>
    favorites.includes(char.slug as CharacterSlug)
  );

  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
        <Link href="/chat" className="flex flex-row items-center gap-2 px-2">
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
            <Link href="/chat">
              <PlusIcon className="size-4" />
              <span>New Chat</span>
            </Link>
          </Button>
        </div>

        {/* Favorites */}
        {isFavoritesLoading ? (
          <SidebarGroup>
            <SidebarGroupLabel>Favorites</SidebarGroupLabel>
            <SidebarMenu>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                  <Skeleton className="size-6 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : favoriteCharacters.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Favorites</SidebarGroupLabel>
            <SidebarMenu>
              {favoriteCharacters.map((char) => (
                <SidebarMenuButton key={char.slug} asChild>
                  <Link
                    href={`/chat?character=${char.slug}`}
                    className="flex items-center gap-2"
                  >
                    <CharacterAvatar slug={char.slug} size="sm" />
                    <span className="flex-1 truncate">{char.name}</span>
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : null}

        {/* Conversation history */}
        {isConversationsLoading ? (
          <SidebarGroup>
            <SidebarGroupLabel>Recent</SidebarGroupLabel>
            <SidebarMenu>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : groupedConversations.length === 0 ? (
          <SidebarGroup>
            <div className="text-muted-foreground flex flex-col items-center gap-2 px-4 py-8 text-center">
              <MessageSquare className="size-8 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          </SidebarGroup>
        ) : (
          groupedConversations.map(([period, convs]) => (
            <SidebarGroup key={period}>
              <SidebarGroupLabel>{period}</SidebarGroupLabel>
              <SidebarMenu>
                {convs.map((conversation) => (
                  <SidebarMenuButton
                    key={conversation.id}
                    asChild
                    isActive={conversation.id === currentConversationId}
                    className="group/item"
                  >
                    <Link
                      href={`/chat/${conversation.id}`}
                      className="flex items-center gap-2"
                    >
                      <CharacterAvatar
                        slug={conversation.character_slug}
                        size="xs"
                      />
                      <span className="flex-1 truncate">
                        {conversation.title ?? "New conversation"}
                      </span>
                      <button
                        onClick={(e) => handleDeleteClick(e, conversation)}
                        className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover/item:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </Link>
                  </SidebarMenuButton>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <UsageIndicator variant="sidebar" />
        <div className="p-2 pt-0">
          <SidebarMenuButton asChild>
            <Link href="/settings/profile" className="flex items-center gap-2">
              <div className="bg-primary/10 flex size-6 shrink-0 items-center justify-center rounded-full">
                <span className="text-primary text-xs font-medium">
                  {avatarInitial}
                </span>
              </div>
              <span className="flex-1 truncate text-sm">{displayName}</span>
              <Settings className="text-muted-foreground size-4" />
            </Link>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;
              {conversationToDelete?.title ?? "this conversation"}&quot; and all
              its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteConversation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
