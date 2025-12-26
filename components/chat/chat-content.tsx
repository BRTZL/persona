"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUp,
  Copy,
  Mic,
  MoreHorizontal,
  Pencil,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ui/message";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { ScrollButton } from "@/components/ui/scroll-button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Character } from "@/lib/characters";
import { cn } from "@/lib/utils";
import { type Message as DbMessage, chatKeys } from "@/queries";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatApiResponse = {
  conversationId: string;
  userMessage: { id: string; role: string; content: string };
  assistantMessage: { id: string; role: string; content: string };
};

type ChatContentProps = {
  character: Character;
  conversationId?: string;
  initialMessages?: DbMessage[];
};

export function ChatContent({
  character,
  conversationId,
  initialMessages = [],
}: ChatContentProps) {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    initialMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }))
  );
  const [currentConversationId, setCurrentConversationId] = useState<
    string | undefined
  >(conversationId);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const userMessage = prompt.trim();
    setPrompt("");
    setIsLoading(true);

    // Optimistically add user message
    const tempUserMessageId = `temp-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: tempUserMessageId,
      role: "user",
      content: userMessage,
    };

    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);

    try {
      // Build history for AI context (exclude the optimistic message)
      const history = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call API - it handles conversation creation and message saving
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          characterSlug: character.slug,
          conversationId: currentConversationId,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = (await response.json()) as ChatApiResponse;

      // Replace temp message with saved one and add assistant response
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === tempUserMessageId
            ? {
                id: data.userMessage.id,
                role: "user" as const,
                content: data.userMessage.content,
              }
            : m
        )
      );

      setChatMessages((prev) => [
        ...prev,
        {
          id: data.assistantMessage.id,
          role: "assistant" as const,
          content: data.assistantMessage.content,
        },
      ]);

      // Update conversation ID and URL if this was a new conversation
      if (!currentConversationId) {
        setCurrentConversationId(data.conversationId);
        // Update URL without navigation (just change the address bar)
        window.history.replaceState(null, "", `/chat/${data.conversationId}`);
      }

      // Invalidate queries to refresh sidebar
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      if (currentConversationId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversation(currentConversationId),
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Remove optimistic message and show error
      setChatMessages((prev) => prev.filter((m) => m.id !== tempUserMessageId));
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-3 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center gap-3">
          <Image
            src={character.avatarUrl}
            alt={character.name}
            width={32}
            height={32}
            className="size-8 rounded-full"
          />
          <div>
            <div className="text-foreground font-medium">{character.name}</div>
            <div className="text-muted-foreground text-xs">
              {character.description}
            </div>
          </div>
        </div>
      </header>

      <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-0 px-5 py-12">
            {chatMessages.length === 0 ? (
              <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-20">
                <Image
                  src={character.avatarUrl}
                  alt={character.name}
                  width={80}
                  height={80}
                  className="mb-4 size-20 rounded-full"
                />
                <h2 className="mb-2 text-xl font-semibold">{character.name}</h2>
                <p className="text-muted-foreground mb-6 text-center">
                  {character.description}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {character.kickstartMessages.slice(0, 4).map((msg, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto px-4 py-3 text-left whitespace-normal"
                      onClick={() => {
                        setPrompt(msg);
                      }}
                    >
                      {msg}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              chatMessages.map((message, index) => {
                const isAssistant = message.role === "assistant";
                const isLastMessage = index === chatMessages.length - 1;

                return (
                  <Message
                    key={message.id}
                    className={cn(
                      "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
                      isAssistant ? "items-start" : "items-end"
                    )}
                  >
                    {isAssistant ? (
                      <div className="group flex w-full flex-col gap-0">
                        <MessageContent
                          className="prose text-foreground flex-1 rounded-lg bg-transparent p-0"
                          markdown
                        >
                          {message.content}
                        </MessageContent>
                        <MessageActions
                          className={cn(
                            "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                            isLastMessage && "opacity-100"
                          )}
                        >
                          <MessageAction tooltip="Copy" delayDuration={100}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                            >
                              <Copy />
                            </Button>
                          </MessageAction>
                          <MessageAction tooltip="Upvote" delayDuration={100}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                            >
                              <ThumbsUp />
                            </Button>
                          </MessageAction>
                          <MessageAction tooltip="Downvote" delayDuration={100}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                            >
                              <ThumbsDown />
                            </Button>
                          </MessageAction>
                        </MessageActions>
                      </div>
                    ) : (
                      <div className="group flex flex-col items-end gap-1">
                        <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 sm:max-w-[75%]">
                          {message.content}
                        </MessageContent>
                        <MessageActions
                          className={cn(
                            "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                          )}
                        >
                          <MessageAction tooltip="Edit" delayDuration={100}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                            >
                              <Pencil />
                            </Button>
                          </MessageAction>
                          <MessageAction tooltip="Delete" delayDuration={100}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                            >
                              <Trash />
                            </Button>
                          </MessageAction>
                          <MessageAction tooltip="Copy" delayDuration={100}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                            >
                              <Copy />
                            </Button>
                          </MessageAction>
                        </MessageActions>
                      </div>
                    )}
                  </Message>
                );
              })
            )}
          </ChatContainerContent>
          <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      </div>

      <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <div className="mx-auto max-w-3xl">
          <PromptInput
            isLoading={isLoading}
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={handleSubmit}
            className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
          >
            <div className="flex flex-col">
              <PromptInputTextarea
                placeholder={`Ask ${character.name} anything...`}
                className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
              />

              <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                <div className="flex items-center gap-2">
                  <PromptInputAction tooltip="Add a new action">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Plus size={18} />
                    </Button>
                  </PromptInputAction>

                  <PromptInputAction tooltip="More actions">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <MoreHorizontal size={18} />
                    </Button>
                  </PromptInputAction>
                </div>
                <div className="flex items-center gap-2">
                  <PromptInputAction tooltip="Voice input">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Mic size={18} />
                    </Button>
                  </PromptInputAction>

                  <Button
                    size="icon"
                    disabled={!prompt.trim() || isLoading}
                    onClick={handleSubmit}
                    className="size-9 rounded-full"
                  >
                    {!isLoading ? (
                      <ArrowUp size={18} />
                    ) : (
                      <span className="size-3 rounded-xs bg-white" />
                    )}
                  </Button>
                </div>
              </PromptInputActions>
            </div>
          </PromptInput>
        </div>
      </div>
    </main>
  );
}
