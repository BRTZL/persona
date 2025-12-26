"use client";

import type { RefObject } from "react";
import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { TextStreamChatTransport } from "ai";
import type { Model } from "@/lib/models";
import { chatKeys } from "@/queries";

/**
 * Database message format - matches what we get from Supabase
 */
type DbMessage = {
  id: string;
  role: string;
  content: string;
};

/**
 * Configuration options for the chat session hook
 */
type UseChatSessionConfig = {
  /** Character slug for the chat - undefined means no character selected yet */
  characterSlug: string | undefined;
  /** Ref to current conversation ID - read at send-time for dynamic updates */
  conversationIdRef: RefObject<string | null>;
  /** Stable client-side chat identifier to avoid useChat resets when server ID changes */
  chatId?: string;
  /** Ref to current model - read at send-time for dynamic updates */
  modelIdRef: RefObject<Model>;
  /** Pre-existing messages to load into the chat */
  initialMessages?: DbMessage[];
  /** Callback when an error occurs during chat */
  onError?: (error: Error) => void;
  /** Optional custom fetch implementation for capturing headers, etc. */
  customFetch?: (
    url: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<Response>;
};

/**
 * Text part of a message - the most common part type
 */
type TextPart = {
  type: "text";
  text: string;
};

/**
 * Return type for the chat session hook
 */
type UseChatSessionReturn = {
  /** The messages in the current chat session */
  messages: UIMessage[];
  /** Current status of the chat session */
  status: "ready" | "streaming" | "submitted" | "error";
  /** Whether the chat is currently loading (streaming or submitted) */
  isLoading: boolean;
  /** Whether a response is currently being streamed */
  isStreaming: boolean;
  /** Whether a message has been submitted and is waiting for a response */
  isSubmitting: boolean;
  /** Send a new message to the chat */
  sendMessage: (text: string) => void;
  /** Stop the current streaming response */
  stop: () => void;
  /** Extract text content from a message's parts */
  getMessageContent: (message: UIMessage) => string;
};

/**
 * Converts database messages to the UIMessage format expected by useChat
 */
function convertDbMessagesToUIMessages(dbMessages: DbMessage[]): UIMessage[] {
  return dbMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
  }));
}

/**
 * Extracts text content from a UIMessage by filtering for text parts
 */
function extractMessageContent(message: UIMessage): string {
  return (
    message.parts
      ?.filter((p): p is TextPart => p.type === "text")
      .map((p) => p.text)
      .join("") ?? ""
  );
}

/**
 * Hook that encapsulates all chat session logic including:
 * - Transport configuration with TextStreamChatTransport
 * - Message state management via useChat
 * - Query invalidation on message completion
 * - Status tracking and derived loading states
 *
 * @example
 * ```tsx
 * const conversationIdRef = useRef<string | null>(null);
 * const modelIdRef = useRef(DEFAULT_MODEL);
 *
 * const {
 *   messages,
 *   isLoading,
 *   isStreaming,
 *   sendMessage,
 *   stop,
 *   getMessageContent,
 * } = useChatSession({
 *   characterSlug: "aria",
 *   conversationIdRef,
 *   modelIdRef,
 *   initialMessages: [],
 *   onError: (error) => console.error(error),
 * });
 * ```
 */
export function useChatSession(
  config: UseChatSessionConfig
): UseChatSessionReturn {
  const {
    characterSlug,
    conversationIdRef,
    chatId,
    modelIdRef,
    initialMessages = [],
    onError,
    customFetch,
  } = config;

  const queryClient = useQueryClient();

  // Memoize the transport to avoid recreating it on every render
  // Only recreate when the key dependencies change
  // Note: prepareSendMessagesRequest callback reads refs at send-time, not render-time
  /* eslint-disable react-hooks/refs -- refs read in callback executed at send-time */
  const transport = useMemo(() => {
    // If no character slug, create a dummy transport that won't be used
    // This handles the case of new chats before character selection
    return new TextStreamChatTransport({
      api: "/api/chat",
      // Use prepareSendMessagesRequest to build the complete request body at send-time
      // This ensures conversationId and model are always current (read from refs)
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          characterSlug,
          conversationId: conversationIdRef.current,
          model: modelIdRef.current.id,
        },
      }),
      fetch: customFetch,
    });
  }, [characterSlug, conversationIdRef, modelIdRef, customFetch]);
  /* eslint-enable react-hooks/refs */

  // Convert initial messages to UIMessage format
  const convertedInitialMessages = useMemo(
    () => convertDbMessagesToUIMessages(initialMessages),
    [initialMessages]
  );

  // Create a stable chat ID - do NOT include modelId to prevent reset on model change
  // The model is passed via transport body, not the session identity
  // Note: chatId should always be provided by the parent for stability
  const chatIdentity = useMemo(
    () => chatId ?? `new-${characterSlug ?? "none"}`,
    [chatId, characterSlug]
  );

  const {
    messages,
    sendMessage: sendMessageRaw,
    status,
    stop,
  } = useChat({
    id: chatIdentity,
    messages: convertedInitialMessages,
    transport,
    onFinish: () => {
      // Invalidate conversations list to update sidebar
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });

      // Invalidate again after delay to catch async title generation
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      }, 2000);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      onError?.(error);
    },
  });

  // Derive loading states from status
  const isStreaming = status === "streaming";
  const isSubmitting = status === "submitted";
  const isLoading = isStreaming || isSubmitting;

  // Wrapper for sendMessage that takes a simple string
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    sendMessageRaw({ text });
  };

  return {
    messages,
    status,
    isLoading,
    isStreaming,
    isSubmitting,
    sendMessage,
    stop,
    getMessageContent: extractMessageContent,
  };
}
