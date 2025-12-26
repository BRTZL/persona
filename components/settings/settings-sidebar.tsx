"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Settings, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-2 py-4">
        <Link
          href="/chat"
          className="text-muted-foreground hover:text-foreground group flex items-center gap-2 px-2 transition-colors"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm">Back to Chat</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Settings className="size-3.5" />
            Settings
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings/profile"}
            >
              <Link
                href="/settings/profile"
                className="flex items-center gap-2"
              >
                <User className="size-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
