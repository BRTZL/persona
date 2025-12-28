"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CreditCard,
  LogOut,
  Palette,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLogout } from "@/queries";

type SettingsLayoutProps = {
  children: ReactNode;
};

const navItems = [
  {
    href: "/settings/profile",
    icon: User,
    label: "Profile",
  },
  {
    href: "/settings/usage",
    icon: BarChart3,
    label: "Usage",
  },
  {
    href: "/settings/appearance",
    icon: Palette,
    label: "Appearance",
  },
  {
    href: "/settings/subscription",
    icon: CreditCard,
    label: "Subscription",
  },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const logout = useLogout();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onError: () => {
        toast.error("Failed to sign out");
      },
    });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/chat"
            className="text-muted-foreground hover:text-foreground group mb-4 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Chat
          </Link>
          <h1 className="text-lg font-medium">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account settings and preferences
          </p>
        </header>

        {/* Content with Sidebar */}
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar Navigation */}
          <nav className="shrink-0 md:w-48">
            <div className="flex flex-col gap-1">
              {/* Mobile: horizontal scrollable tabs */}
              <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:px-0 md:pb-0">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Logout Button - Desktop: at bottom, Mobile: after tabs */}
              <div className="mt-4 border-t pt-4 md:mt-auto">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive w-full justify-start gap-2"
                  onClick={() => setShowLogoutDialog(true)}
                  disabled={logout.isPending}
                >
                  <LogOut className="size-4" />
                  {logout.isPending ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleLogout}>
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
