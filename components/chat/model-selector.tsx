"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AVAILABLE_MODELS, type Model } from "@/lib/models";
import { cn } from "@/lib/utils";

type ModelSelectorProps = {
  selectedModel: Model;
  onSelect: (model: Model) => void;
};

export function ModelSelector({ selectedModel, onSelect }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
                    onSelect(model);
                    setOpen(false);
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
                    <span className="font-medium">{model.name}</span>
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
  );
}
