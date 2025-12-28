"use client";

import Link from "next/link";
import { AlertCircle, ArrowUp, Square } from "lucide-react";
import { CharacterSelector } from "@/components/chat/character-selector";
import { ModelSelector } from "@/components/chat/model-selector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import type { Character } from "@/lib/characters";
import type { Model } from "@/lib/models";

type ChatInputProps = {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  isRateLimited?: boolean;
  character: Character | null;
  selectedModel: Model;
  onModelChange: (model: Model) => void;
  // Character selection (only for new chats)
  showCharacterSelector?: boolean;
  onCharacterSelect?: (slug: string) => void;
};

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  onStop,
  isLoading,
  isStreaming,
  isRateLimited = false,
  character,
  selectedModel,
  onModelChange,
  showCharacterSelector = false,
  onCharacterSelect,
}: ChatInputProps) {
  const placeholder = isRateLimited
    ? "Daily message limit reached"
    : character
      ? `Message ${character.name}...`
      : "Select a persona to start...";

  const isSubmitDisabled =
    !input.trim() ||
    (showCharacterSelector && !character) ||
    isLoading ||
    isRateLimited;

  return (
    <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
      <div className="mx-auto max-w-3xl">
        {isRateLimited && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="size-4" />
            <AlertTitle>Daily message limit reached</AlertTitle>
            <AlertDescription>
              You&apos;ve used all your free messages for today.{" "}
              <Link
                href="/settings/subscription"
                className="font-medium underline"
              >
                Upgrade your plan
              </Link>{" "}
              for unlimited messages.
            </AlertDescription>
          </Alert>
        )}
        <PromptInput
          isLoading={isLoading}
          value={input}
          onValueChange={onInputChange}
          onSubmit={onSubmit}
          className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
        >
          <div className="flex flex-col">
            <PromptInputTextarea
              placeholder={placeholder}
              disabled={isRateLimited}
              className="min-h-11 pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
            />

            <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
              <div className="flex items-center gap-2">
                <ModelSelector
                  selectedModel={selectedModel}
                  onSelect={onModelChange}
                />

                {showCharacterSelector && onCharacterSelect && (
                  <CharacterSelector
                    selectedCharacter={character}
                    onSelect={onCharacterSelect}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={onStop}
                    className="size-9 rounded-full"
                  >
                    <Square size={14} />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    disabled={isSubmitDisabled}
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
  );
}
