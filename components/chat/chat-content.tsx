"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { useChatSession } from "@/hooks/use-chat-session";
import { useClipboard } from "@/hooks/use-clipboard";
import type { Character } from "@/lib/characters";
import { getCharacter } from "@/lib/characters";
import { DEFAULT_MODEL, type Model } from "@/lib/models";
import type { Message as DbMessage } from "@/queries";

type ChatContentProps = {
  /** Character for the chat - if undefined, shows character selector */
  character?: Character;
  /** Existing conversation ID (for loading existing conversations) */
  conversationId?: string;
  /** Pre-loaded messages from database */
  initialMessages?: DbMessage[];
  /** Auto-send message on mount (from URL params) */
  autoSendMessage?: string;
};

export function ChatContent({
  character: characterProp,
  conversationId: initialConversationId,
  initialMessages = [],
  autoSendMessage,
}: ChatContentProps) {
  const isNewChat = !initialConversationId;

  // Use nuqs for URL query state - only active for new chats
  const [characterSlug, setCharacterSlug] = useQueryState("character", {
    shallow: false,
  });

  // Derive character from prop (existing chat) or URL (new chat)
  const characterFromUrl = characterSlug
    ? (getCharacter(characterSlug) ?? null)
    : null;

  const [selectedModel, setSelectedModel] = useState<Model>(DEFAULT_MODEL);
  const [input, setInput] = useState("");
  // Track if user manually started chat (triggers re-render to show messages view)
  const [hasManuallyStarted, setHasManuallyStarted] = useState(false);
  const hasAutoSent = useRef(false);
  // Ref for conversation ID - used by transport to send with each message
  // Updated when server assigns an ID on first message
  const conversationIdRef = useRef<string | null>(
    initialConversationId ?? null
  );
  // Store the active character once a conversation starts (survives URL change to /chat/[id])
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(
    null
  );

  // Determine selected character:
  // 1. If prop provided (existing chat), use it
  // 2. If we have an active conversation, use the stored character
  // 3. Otherwise, derive from URL
  const selectedCharacter =
    characterProp ?? activeCharacter ?? characterFromUrl;

  // Track previous character slug to detect changes
  const prevCharacterSlugRef = useRef(selectedCharacter?.slug);

  // Keep ref in sync when the initial conversation changes (e.g., navigation)
  useEffect(() => {
    conversationIdRef.current = initialConversationId ?? null;
  }, [initialConversationId]);

  // Reset chat state when character changes via URL navigation
  // But DON'T reset if we've already captured a conversation ID (user started chatting)
  useEffect(() => {
    const prevSlug = prevCharacterSlugRef.current;
    const currentSlug = selectedCharacter?.slug;

    if (prevSlug !== currentSlug) {
      prevCharacterSlugRef.current = currentSlug;
      // Only reset if:
      // 1. This is a new chat (no initial conversation ID)
      // 2. Character actually changed (prevSlug was set)
      // 3. We haven't captured a conversation ID yet (user hasn't started chatting)
      const hasActiveConversation = conversationIdRef.current !== null;
      if (isNewChat && prevSlug !== undefined && !hasActiveConversation) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with URL
        setHasManuallyStarted(false);
        setInput("");
        setActiveCharacter(null);
      }
    }
  }, [selectedCharacter?.slug, isNewChat]);

  // Handle character selection - nuqs automatically syncs with URL
  const handleCharacterSelect = (slug: string) => {
    // Clear active character since user is selecting a new one
    setActiveCharacter(null);
    conversationIdRef.current = null;
    setCharacterSlug(slug);
  };

  // Use ref to access current model in prepareSendMessagesRequest
  const selectedModelRef = useRef(selectedModel);
  useEffect(() => {
    selectedModelRef.current = selectedModel;
  }, [selectedModel]);

  // Custom fetch to capture conversation ID from response headers
  // Body modification is now handled by prepareSendMessagesRequest in the transport
  const customFetch = useCallback(
    async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const response = await fetch(url, init);

      // Capture conversation ID from headers on first response only
      // Update both the ref (for subsequent sends) and the URL (for bookmarking)
      if (!conversationIdRef.current && !initialConversationId) {
        const newConversationId = response.headers.get("X-Conversation-Id");
        if (newConversationId) {
          conversationIdRef.current = newConversationId;
          window.history.replaceState(null, "", `/chat/${newConversationId}`);
        }
      }

      return response;
    },
    [initialConversationId]
  );

  // Convert initialMessages to the format expected by useChatSession
  const formattedInitialMessages = initialMessages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }));

  // Keep a stable chat ID so useChat state doesn't reset when the server assigns an ID
  const chatSessionId = useMemo(
    () =>
      `${initialConversationId ?? "new"}-${selectedCharacter?.slug ?? "none"}`,
    [initialConversationId, selectedCharacter?.slug]
  );

  // Use chat session hook for managing chat state
  // Refs are passed so prepareSendMessagesRequest can read current values at send-time
  const {
    messages,
    status,
    isLoading,
    isStreaming,
    isSubmitting,
    sendMessage,
    stop,
    getMessageContent,
  } = useChatSession({
    characterSlug: selectedCharacter?.slug,
    conversationIdRef,
    chatId: chatSessionId,
    modelIdRef: selectedModelRef,
    initialMessages: formattedInitialMessages,
    customFetch,
  });

  // Use clipboard hook for copy functionality
  const { copy } = useClipboard();

  // Auto-send message if provided (from URL params)
  useEffect(() => {
    if (
      autoSendMessage &&
      !hasAutoSent.current &&
      status === "ready" &&
      selectedCharacter
    ) {
      hasAutoSent.current = true;
      // Don't call setState here - just send the message
      // hasStartedChat will be derived from messages.length > 0
      sendMessage(autoSendMessage);
    }
  }, [autoSendMessage, sendMessage, status, selectedCharacter]);

  // Derive hasStartedChat from state or messages
  // Once there are messages or user has manually started, the chat has started
  const hasStartedChat = hasManuallyStarted || messages.length > 0;

  // Handle form submission
  const handleSubmit = () => {
    if (!input.trim() || !selectedCharacter || isLoading) return;
    // Store the character so it survives URL change to /chat/[id]
    setActiveCharacter(selectedCharacter);
    setHasManuallyStarted(true);
    sendMessage(input);
    setInput("");
  };

  // Handle kickstart message selection
  const handleKickstartSelect = (message: string) => {
    setInput(message);
  };

  // Determine UI states
  const showWelcome = !hasStartedChat && messages.length === 0;
  const showCharacterSelector = !characterProp && !hasStartedChat;

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <ChatHeader
        character={selectedCharacter}
        hasStartedChat={hasStartedChat}
      />

      {showWelcome ? (
        <ChatWelcome
          character={selectedCharacter}
          onCharacterSelect={handleCharacterSelect}
          onKickstartSelect={handleKickstartSelect}
        />
      ) : (
        <ChatMessages
          messages={messages}
          isStreaming={isStreaming}
          isSubmitting={isSubmitting}
          getMessageContent={getMessageContent}
          onCopy={copy}
        />
      )}

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onStop={stop}
        isLoading={isLoading}
        isStreaming={isStreaming}
        character={selectedCharacter}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        showCharacterSelector={showCharacterSelector}
        onCharacterSelect={handleCharacterSelect}
      />
    </main>
  );
}
