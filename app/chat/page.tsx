"use client";

import { Suspense } from "react";
import { ChatContent, ChatSidebar } from "@/components/chat";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ChatPage() {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <Suspense>
          <ChatContent />
        </Suspense>
      </SidebarInset>
      <OnboardingModal />
    </SidebarProvider>
  );
}
