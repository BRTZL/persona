"use client";

import { use, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUp,
  Copy,
  Mic,
  MoreHorizontal,
  Pencil,
  Plus,
  PlusIcon,
  Search,
  Sparkles,
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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  type Character,
  getAllCharacters,
  getCharacter,
} from "@/lib/characters";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

// Placeholder conversation history - will be replaced in Phase 5
const conversationHistory = [
  {
    period: "Today",
    conversations: [
      {
        id: "t1",
        title: "New conversation",
        timestamp: Date.now(),
      },
    ],
  },
];

function ChatSidebar({ character }: { character: Character }) {
  const allCharacters = getAllCharacters();

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
            <Link href={`/chat/new/${character.slug}`}>
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
                isActive={char.slug === character.slug}
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

        {/* Conversation history placeholder */}
        {conversationHistory.map((group) => (
          <SidebarGroup key={group.period}>
            <SidebarGroupLabel>{group.period}</SidebarGroupLabel>
            <SidebarMenu>
              {group.conversations.map((conversation) => (
                <SidebarMenuButton key={conversation.id}>
                  <span>{conversation.title}</span>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

function ChatContent({ character }: { character: Character }) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const userMessage = prompt.trim();
    setPrompt("");
    setIsLoading(true);

    // Add user message immediately
    const newUserMessage: ChatMessage = {
      id: chatMessages.length + 1,
      role: "user",
      content: userMessage,
    };

    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          characterSlug: character.slug,
          history: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = (await response.json()) as { role: string; content: string };

      const assistantResponse: ChatMessage = {
        id: updatedMessages.length + 1,
        role: "assistant",
        content: data.content,
      };

      setChatMessages((prev) => [...prev, assistantResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: updatedMessages.length + 1,
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

export default function ChatPage({
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
      <ChatSidebar character={character} />
      <SidebarInset>
        <ChatContent character={character} />
      </SidebarInset>
    </SidebarProvider>
  );
}
