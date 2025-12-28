"use client";

import { useState } from "react";
import { Check, User } from "lucide-react";
import { toast } from "sonner";
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
import { useUpdateDisplayName, useUser } from "@/queries";

export default function ProfileSettingsPage() {
  const { data: user, isLoading: isUserLoading } = useUser();

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

  const currentDisplayName = user?.user_metadata?.display_name as
    | string
    | undefined;
  const hasNameChanged =
    displayName.trim() !==
    (currentDisplayName ?? user?.email?.split("@")[0] ?? "");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-medium">Profile</h2>
        <p className="text-muted-foreground text-sm">
          Manage your profile information
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <User className="text-primary size-4" />
            </div>
            <div>
              <CardTitle>Display Name</CardTitle>
              <CardDescription>
                This is how you appear in the app
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
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
                  disabled={!hasNameChanged || updateDisplayName.isPending}
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
    </div>
  );
}
