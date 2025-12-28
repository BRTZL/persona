"use client";

import { useTheme } from "next-themes";
import { Laptop, Moon, RotateCcw, Sun } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useResetOnboarding } from "@/queries";

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

export default function AppearancePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const resetOnboarding = useResetOnboarding();

  const handleResetOnboarding = () => {
    resetOnboarding.mutate(undefined, {
      onSuccess: () => {
        toast.success("Onboarding reset. You will see it on your next visit.");
      },
      onError: () => {
        toast.error("Failed to reset onboarding");
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-medium">Appearance</h2>
        <p className="text-muted-foreground text-sm">
          Customize how the app looks and feels
        </p>
      </div>

      {/* Theme Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <Sun className="text-primary size-4" />
            </div>
            <div>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose your preferred color scheme
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Color Mode</Label>
            <div className="flex flex-wrap gap-2">
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

      {/* Onboarding Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <RotateCcw className="text-primary size-4" />
            </div>
            <div>
              <CardTitle>Onboarding</CardTitle>
              <CardDescription>Reset the welcome experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              This will show the onboarding experience again the next time you
              visit the chat.
            </p>
            <Button
              variant="outline"
              onClick={handleResetOnboarding}
              disabled={resetOnboarding.isPending}
            >
              <RotateCcw className="mr-2 size-4" />
              {resetOnboarding.isPending ? "Resetting..." : "Reset Onboarding"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
