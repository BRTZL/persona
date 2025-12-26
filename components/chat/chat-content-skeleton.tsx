"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

function MessageSkeleton({ isUser }: { isUser: boolean }) {
  return (
    <div
      className={`mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 ${isUser ? "items-end" : "items-start"}`}
    >
      {isUser ? (
        <Skeleton className="h-10 w-32 rounded-3xl" />
      ) : (
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-3/4 max-w-md" />
          <Skeleton className="h-4 w-1/2 max-w-sm" />
        </div>
      )}
    </div>
  );
}

export function ChatContentSkeleton() {
  return (
    <main className="flex h-screen flex-col overflow-hidden">
      {/* Header skeleton */}
      <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-3 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* Chat content skeleton */}
      <div className="relative flex-1 overflow-y-auto">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-6 px-5 py-12">
            <MessageSkeleton isUser={true} />
            <MessageSkeleton isUser={false} />
            <MessageSkeleton isUser={true} />
            <MessageSkeleton isUser={false} />
          </ChatContainerContent>
        </ChatContainerRoot>
      </div>

      {/* Input skeleton */}
      <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <div className="mx-auto max-w-3xl">
          <div className="border-input bg-popover w-full rounded-3xl border p-4 shadow-xs">
            <Skeleton className="mb-4 h-6 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="size-9 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
