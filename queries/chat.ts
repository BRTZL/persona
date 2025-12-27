import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Tables } from "@/generated/database.types";
import { createClient } from "@/lib/supabase/client";

export type Conversation = Tables<"conversations">;
export type Message = Tables<"messages">;

export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

// Query keys factory
export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => ["chat", "conversations"] as const,
  conversation: (id: string) => ["chat", "conversation", id] as const,
};

// Get a single conversation with its messages
export function conversationQueryOptions(id: string) {
  return queryOptions({
    queryKey: chatKeys.conversation(id),
    queryFn: async (): Promise<ConversationWithMessages | null> => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("conversations")
        .select("*, messages(*)")
        .eq("id", id)
        .order("created_at", { referencedTable: "messages", ascending: true })
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data;
    },
    staleTime: 1000 * 60,
  });
}

// Get all conversations for the current user
export function conversationsQueryOptions() {
  return queryOptions({
    queryKey: chatKeys.conversations(),
    queryFn: async (): Promise<Conversation[]> => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep in cache for persistence
  });
}

// Update conversation title
export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      title,
    }: {
      conversationId: string;
      title: string;
    }) => {
      const supabase = createClient();

      const { error } = await supabase
        .from("conversations")
        .update({ title })
        .eq("id", conversationId);

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}

// Delete conversation (messages cascade automatically)
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const supabase = createClient();

      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, conversationId) => {
      queryClient.removeQueries({
        queryKey: chatKeys.conversation(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}
