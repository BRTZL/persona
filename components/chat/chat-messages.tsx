"use client";

import type { UIMessage } from "ai";
import { Copy } from "lucide-react";
import { ThinkingIndicator } from "@/components/chat/thinking-indicator";
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
import { ScrollButton } from "@/components/ui/scroll-button";
import { cn } from "@/lib/utils";

type ChatMessagesProps = {
  messages: UIMessage[];
  isStreaming: boolean;
  isSubmitting: boolean;
  getMessageContent: (message: UIMessage) => string;
  onCopy: (content: string) => void;
};

export function ChatMessages({
  messages,
  isStreaming,
  isSubmitting,
  getMessageContent,
  onCopy,
}: ChatMessagesProps) {
  return (
    <div id="chat-container" className="relative flex-1 overflow-y-auto">
      <ChatContainerRoot className="h-full">
        <ChatContainerContent className="space-y-0 px-5 py-12">
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
                      {isLastAssistantStreaming ? content + " ▊" : content}
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
                          onClick={() => onCopy(content)}
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
                          onClick={() => onCopy(content)}
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

          {isSubmitting && <ThinkingIndicator />}
        </ChatContainerContent>
        <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
          <ScrollButton className="shadow-sm" />
        </div>
      </ChatContainerRoot>
    </div>
  );
}
