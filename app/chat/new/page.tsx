"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ChatSidebar } from "@/components/chat";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getAllCharacters } from "@/lib/characters";

export default function NewChatPage() {
  const characters = getAllCharacters();

  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <main className="flex h-screen flex-col overflow-hidden">
          <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-3 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-3">
              <MessageCircle className="text-muted-foreground size-5" />
              <div className="text-foreground font-medium">New Chat</div>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-6 py-12">
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-2xl font-bold">
                  Choose a Persona to Chat With
                </h1>
                <p className="text-muted-foreground">
                  Each AI has a unique personality and expertise. Pick one to
                  start a conversation.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {characters.map((character) => (
                  <Link
                    key={character.slug}
                    href={`/chat/new/${character.slug}`}
                  >
                    <Card className="group hover:border-primary/50 h-full cursor-pointer p-4 transition-all hover:shadow-md">
                      <div className="flex flex-col items-center text-center">
                        <div className="ring-border group-hover:ring-primary/50 mb-3 size-16 overflow-hidden rounded-full ring-2 ring-offset-2 transition-all">
                          <Image
                            src={character.avatarUrl}
                            alt={character.name}
                            width={64}
                            height={64}
                            className="size-full object-cover"
                          />
                        </div>
                        <h3 className="mb-1 font-semibold">{character.name}</h3>
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {character.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
