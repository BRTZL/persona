"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { createQueryClient } from "@/lib/query-client";
import { createPersister, persistOptions } from "@/lib/query-persister";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  const [persister] = useState(() => createPersister());

  const content = (
    <>
      <NuqsAdapter>{children}</NuqsAdapter>
      <Toaster />
    </>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {persister ? (
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, ...persistOptions }}
        >
          {content}
        </PersistQueryClientProvider>
      ) : (
        <QueryClientProvider client={queryClient}>
          {content}
        </QueryClientProvider>
      )}
    </ThemeProvider>
  );
}
