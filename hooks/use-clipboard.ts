"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type UseClipboardOptions = {
  /** Duration in ms before copied state resets. Defaults to 2000. */
  resetTimeout?: number;
  /** Custom success message. Defaults to "Copied to clipboard". */
  successMessage?: string;
};

type UseClipboardReturn = {
  /** Copy text to clipboard */
  copy: (text: string) => Promise<void>;
  /** Whether text was recently copied */
  copied: boolean;
};

export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardReturn {
  const { resetTimeout = 2000, successMessage = "Copied to clipboard" } =
    options;

  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);

      setCopied(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset copied state after timeout
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, resetTimeout);
    },
    [successMessage, resetTimeout]
  );

  return { copy, copied };
}
