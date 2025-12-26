"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { TextStreamChatTransport } from "ai";
import { ArrowUp, Check, ChevronDown, Copy, Square } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ui/message";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { ScrollButton } from "@/components/ui/scroll-button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Character } from "@/lib/characters";
import { AVAILABLE_MODELS, DEFAULT_MODEL, type Model } from "@/lib/models";
import { cn } from "@/lib/utils";
import { type Message as DbMessage, chatKeys } from "@/queries";

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
  const [currentConversationId, setCurrentConversationId] =
    useState(conversationId);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model>(DEFAULT_MODEL);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  const { messages, sendMessage, status, stop } = useChat({
    id: currentConversationId ?? "new",
    messages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content }],
    })),
    transport: new TextStreamChatTransport({
      api: "/api/chat",
      body: {
        characterSlug: character.slug,
        conversationId: currentConversationId,
        model: selectedModel.id,
      },
    }),
    onFinish: () => {
      // Messages are saved server-side, just refresh sidebar
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Handle new conversation ID after first message
  useEffect(() => {
    // If we don't have a conversation ID yet but have messages, fetch the latest one
    if (!currentConversationId && messages.length > 0 && status === "ready") {
      // Query for the latest conversation for this character
      queryClient
        .fetchQuery({
          queryKey: ["chat", "latest", character.slug],
          queryFn: async () => {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data } = await supabase
              .from("conversations")
              .select("id")
              .eq("character_slug", character.slug)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();
            return data?.id ?? null;
          },
        })
        .then((newId) => {
          if (newId) {
            setCurrentConversationId(newId);
            window.history.replaceState(null, "", `/chat/${newId}`);
          }
        });
    }
  }, [
    currentConversationId,
    messages.length,
    status,
    character.slug,
    queryClient,
  ]);

  // Streaming status indicators
  const isStreaming = status === "streaming";
  const isSubmitting = status === "submitted";
  const isLoading = isStreaming || isSubmitting;

  const onSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  // Helper to get text content from message parts
  const getMessageContent = (msg: (typeof messages)[number]) => {
    return (
      msg.parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("") ?? ""
    );
  };

  // Copy message content to clipboard
  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
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
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <div id="chat-container" className="relative flex-1 overflow-y-auto">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-0 px-5 py-12">
            {messages.length === 0 ? (
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
                        setInput(msg);
                      }}
                    >
                      {msg}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isAssistant = message.role === "assistant";
                  const isLastMessage = index === messages.length - 1;
                  const isLastAssistantStreaming =
                    isLastMessage && isAssistant && isStreaming;
                  const content = getMessageContent(message);

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
                            {isLastAssistantStreaming
                              ? content + " ▊"
                              : content}
                          </MessageContent>
                          <MessageActions
                            className={cn(
                              "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                              isLastMessage && !isStreaming && "opacity-100"
                            )}
                          >
                            <MessageAction tooltip="Copy" delayDuration={100}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => handleCopy(content)}
                              >
                                <Copy />
                              </Button>
                            </MessageAction>
                          </MessageActions>
                        </div>
                      ) : (
                        <div className="group flex w-full flex-col items-end gap-1">
                          <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 sm:max-w-[75%]">
                            {content}
                          </MessageContent>
                          <MessageActions
                            className={cn(
                              "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                            )}
                          >
                            <MessageAction tooltip="Copy" delayDuration={100}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => handleCopy(content)}
                              >
                                <Copy />
                              </Button>
                            </MessageAction>
                          </MessageActions>
                        </div>
                      )}
                    </Message>
                  );
                })}

                {/* Thinking indicator */}
                {isSubmitting && (
                  <Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-6">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <div className="flex gap-1">
                        <span
                          className="animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        >
                          ●
                        </span>
                        <span
                          className="animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        >
                          ●
                        </span>
                        <span
                          className="animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        >
                          ●
                        </span>
                      </div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </Message>
                )}
              </>
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
            value={input}
            onValueChange={setInput}
            onSubmit={onSubmit}
            className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
          >
            <div className="flex flex-col">
              <PromptInputTextarea
                placeholder={`Ask ${character.name} anything...`}
                className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
              />

              <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                <Popover
                  open={modelSelectorOpen}
                  onOpenChange={setModelSelectorOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-full px-3"
                    >
                      <span className="text-xs">{selectedModel.name}</span>
                      <ChevronDown className="size-3 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start" side="top">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {AVAILABLE_MODELS.map((model) => (
                            <CommandItem
                              key={model.id}
                              value={model.id}
                              onSelect={() => {
                                setSelectedModel(model);
                                setModelSelectorOpen(false);
                              }}
                              className="flex items-start gap-3 px-3 py-2.5"
                            >
                              <Check
                                className={cn(
                                  "mt-0.5 size-4 shrink-0",
                                  selectedModel.id === model.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium">
                                  {model.name}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {model.description}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2">
                  {isStreaming ? (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={stop}
                      className="size-9 rounded-full"
                    >
                      <Square size={14} />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      disabled={!input.trim() || isLoading}
                      onClick={onSubmit}
                      className="size-9 rounded-full"
                    >
                      <ArrowUp size={18} />
                    </Button>
                  )}
                </div>
              </PromptInputActions>
            </div>
          </PromptInput>
        </div>
      </div>
    </main>
  );
}
