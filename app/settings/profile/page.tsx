"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Check,
  Laptop,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useSignOutOtherSessions,
  useUpdateDisplayName,
  useUsageStats,
  useUser,
} from "@/queries";

type ThemeOption = "light" | "dark" | "system";

const themeOptions: Array<{
  value: ThemeOption;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export default function ProfileSettingsPage() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Get initial display name from user
  const initialDisplayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "";

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [hasEditedName, setHasEditedName] = useState(false);

  // Update display name when user loads (only if not edited)
  if (
    !hasEditedName &&
    displayName !== initialDisplayName &&
    initialDisplayName
  ) {
    setDisplayName(initialDisplayName);
  }

  const updateDisplayName = useUpdateDisplayName();
  const signOutOtherSessions = useSignOutOtherSessions();
  const { data: usageStats, isLoading: isUsageLoading } = useUsageStats();

  const handleSaveDisplayName = () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }
    updateDisplayName.mutate(displayName.trim(), {
      onSuccess: () => {
        toast.success("Display name updated");
      },
      onError: () => {
        toast.error("Failed to update display name");
      },
    });
  };

  const handleSignOutOtherSessions = () => {
    signOutOtherSessions.mutate(undefined, {
      onSuccess: () => {
        toast.success("Signed out of other devices");
      },
      onError: () => {
        toast.error("Failed to sign out other sessions");
      },
    });
  };

  const currentDisplayName = user?.user_metadata?.display_name as
    | string
    | undefined;
  const hasNameChanged =
    displayName.trim() !==
    (currentDisplayName ?? user?.email?.split("@")[0] ?? "");

  return (
    <SidebarProvider>
      <SettingsSidebar />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <header className="border-b px-6 py-4">
            <h1 className="text-lg font-medium">Profile Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your account settings and preferences
            </p>
          </header>

          {/* Content */}
          <div className="flex-1 space-y-6 p-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                    <User className="text-primary size-4" />
                  </div>
                  <div>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your display name</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          setHasEditedName(true);
                        }}
                        placeholder="Enter your display name"
                        className="max-w-xs"
                        disabled={isUserLoading}
                      />
                      <Button
                        onClick={handleSaveDisplayName}
                        disabled={
                          !hasNameChanged || updateDisplayName.isPending
                        }
                        size="sm"
                      >
                        {updateDisplayName.isPending ? (
                          "Saving..."
                        ) : (
                          <>
                            <Check className="mr-1.5 size-3.5" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                    <MessageCircle className="text-primary size-4" />
                  </div>
                  <div>
                    <CardTitle>Usage</CardTitle>
                    <CardDescription>
                      Your message usage statistics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isUsageLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : usageStats ? (
                  <div className="space-y-4">
                    {/* Today's Usage */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Today</span>
                        <span className="font-medium">
                          {usageStats.today_count} / {usageStats.daily_limit}{" "}
                          messages
                        </span>
                      </div>
                      <Progress
                        value={
                          (usageStats.today_count / usageStats.daily_limit) *
                          100
                        }
                        className="h-2"
                      />
                    </div>

                    {/* Weekly & Monthly Stats */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-muted-foreground text-xs tracking-wide uppercase">
                          Last 7 days
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                          {usageStats.week_count}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          messages sent
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-muted-foreground text-xs tracking-wide uppercase">
                          Last 30 days
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                          {usageStats.month_count}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          messages sent
                        </p>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-xs">
                      Daily limit resets at midnight UTC
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Sessions Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                    <Mail className="text-primary size-4" />
                  </div>
                  <div>
                    <CardTitle>Sessions</CardTitle>
                    <CardDescription>
                      Manage your active sessions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
                        <span className="text-primary text-sm font-medium">
                          {user?.email?.[0]?.toUpperCase() ?? "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {user?.email ?? "Loading..."}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Signed in via{" "}
                          {user?.app_metadata?.provider ?? "email"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                      Current
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSignOutOtherSessions}
                    disabled={signOutOtherSessions.isPending}
                  >
                    <LogOut className="mr-2 size-4" />
                    {signOutOtherSessions.isPending
                      ? "Signing out..."
                      : "Sign out other devices"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                    <Sun className="text-primary size-4" />
                  </div>
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how the app looks
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      const isActive = resolvedTheme && theme === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-all",
                            isActive
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          <Icon className="size-4" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
