"use client";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type CommandDialogContextValue = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CommandDialogContext = createContext<CommandDialogContextValue | null>(
  null
);

export function CommandDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const setOpen = useCallback((open: boolean) => setIsOpen(open), []);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <CommandDialogContext.Provider value={{ isOpen, setOpen, toggle }}>
      {children}
    </CommandDialogContext.Provider>
  );
}

export function useCommandDialog(): CommandDialogContextValue {
  const context = useContext(CommandDialogContext);
  if (!context) {
    throw new Error(
      "useCommandDialog must be used within CommandDialogProvider"
    );
  }
  return context;
}
