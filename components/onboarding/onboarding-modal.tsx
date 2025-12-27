"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  MessageCircle,
  Moon,
  Search,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import { CharacterAvatar } from "@/components/character-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { useCompleteOnboarding, useUser } from "@/queries";

type OnboardingStep = 0 | 1 | 2 | 3 | 4;

const ALL_PERSONAS = [
  {
    slug: "luna",
    name: "Luna",
    tagline: "Empathetic listener",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    slug: "nova",
    name: "Nova",
    tagline: "Code architect",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    slug: "atlas",
    name: "Atlas",
    tagline: "Knowledge polymath",
    color: "from-indigo-500/20 to-blue-500/20",
  },
  {
    slug: "spark",
    name: "Spark",
    tagline: "Creative muse",
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    slug: "zen",
    name: "Zen",
    tagline: "Mindful guide",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    slug: "blaze",
    name: "Blaze",
    tagline: "Elite trainer",
    color: "from-red-500/20 to-orange-500/20",
  },
  {
    slug: "echo",
    name: "Echo",
    tagline: "Sharp thinker",
    color: "from-slate-500/20 to-zinc-500/20",
  },
  {
    slug: "pixel",
    name: "Pixel",
    tagline: "Game designer",
    color: "from-pink-500/20 to-fuchsia-500/20",
  },
] as const;

const TOTAL_STEPS = 5;

export function useOnboarding() {
  const { data: user, isLoading } = useUser();
  const completeOnboarding = useCompleteOnboarding();

  const showOnboarding =
    !isLoading && user && !user.user_metadata?.onboarding_completed;

  const handleComplete = useCallback(() => {
    completeOnboarding.mutate();
  }, [completeOnboarding]);

  return {
    showOnboarding: !!showOnboarding,
    completeOnboarding: handleComplete,
    isCompleting: completeOnboarding.isPending,
  };
}

export function OnboardingModal() {
  const { showOnboarding, completeOnboarding, isCompleting } = useOnboarding();
  const [step, setStep] = useState<OnboardingStep>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset step when modal opens
  useEffect(() => {
    if (showOnboarding) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(0);
    }
  }, [showOnboarding]);

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep((s) => (s + 1) as OnboardingStep);
        setIsTransitioning(false);
      }, 150);
    } else {
      completeOnboarding();
    }
  }, [step, completeOnboarding]);

  return (
    <Dialog open={showOnboarding}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "overflow-hidden p-0 transition-all duration-300",
          step === 1 ? "sm:max-w-2xl" : "sm:max-w-lg"
        )}
      >
        {/* Progress indicator */}
        <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 w-6 rounded-full transition-all duration-300",
                i === step
                  ? "bg-primary w-8"
                  : i < step
                    ? "bg-primary/60"
                    : "bg-muted-foreground/20"
              )}
            />
          ))}
        </div>

        {/* Step content with transitions */}
        <div
          className={cn(
            "transition-all duration-150",
            isTransitioning && "translate-x-4 opacity-0"
          )}
        >
          {step === 0 && <WelcomeStep onNext={handleNext} />}
          {step === 1 && <PersonasStep onNext={handleNext} />}
          {step === 2 && <SearchStep onNext={handleNext} />}
          {step === 3 && <CustomizeStep onNext={handleNext} />}
          {step === 4 && (
            <ReadyStep onComplete={handleNext} isCompleting={isCompleting} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative px-6 pt-12 pb-6">
      {/* Animated background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-slow from-primary/20 via-primary/5 absolute -top-20 left-1/2 size-64 -translate-x-1/2 rounded-full bg-gradient-to-br to-transparent blur-3xl" />
      </div>

      <DialogHeader className="relative items-center text-center">
        {/* Logo with glow */}
        <div className="relative mb-6">
          <div className="animate-float bg-primary/10 relative flex size-20 items-center justify-center rounded-2xl">
            <Sparkles className="text-primary size-10" />
          </div>
          <div className="bg-primary/30 absolute inset-0 -z-10 rounded-2xl blur-xl" />
        </div>

        <DialogTitle className="text-2xl font-semibold tracking-tight">
          Welcome to Persona
        </DialogTitle>
        <DialogDescription className="mt-2 max-w-sm text-sm leading-relaxed">
          More than just AI chat. Meet 8 unique AI companions, each with their
          own personality, expertise, and perspective on the world.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-8 flex justify-center">
        <Button onClick={onNext} size="lg" className="group gap-2 px-6">
          Discover Your Companions
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}

function PersonasStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="px-6 pt-12 pb-6">
      <DialogHeader className="mb-6 text-center">
        <DialogTitle className="text-lg font-semibold">
          8 Unique Companions
        </DialogTitle>
        <DialogDescription className="text-sm">
          From code architects to creative muses. Each persona brings something
          special.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-4 gap-2">
        {ALL_PERSONAS.map((persona, i) => (
          <div
            key={persona.slug}
            className={cn(
              "group relative cursor-default overflow-hidden rounded-xl border p-3 transition-all",
              "hover:border-primary/50 hover:shadow-md",
              "animate-fade-up"
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Gradient background on hover */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100",
                persona.color
              )}
            />

            <div className="relative flex flex-col items-center text-center">
              <div className="ring-background mb-2 rounded-full ring-2 transition-transform group-hover:scale-105">
                <CharacterAvatar slug={persona.slug} size="md" />
              </div>
              <h3 className="text-sm font-medium">{persona.name}</h3>
              <p className="text-muted-foreground text-[10px]">
                {persona.tagline}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={onNext} size="lg" className="group gap-2 px-6">
          See What They Can Do
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}

function SearchStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative px-6 pt-12 pb-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-1/2 size-48 -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl" />
      </div>

      <DialogHeader className="relative mb-6 items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
          <Search className="size-8 text-blue-600 dark:text-blue-400" />
        </div>
        <DialogTitle className="text-lg font-semibold">
          Find Anything, Fast
        </DialogTitle>
        <DialogDescription className="text-sm">
          Press the keyboard shortcut to instantly search characters and
          conversations
        </DialogDescription>
      </DialogHeader>

      {/* Keyboard shortcut display */}
      <div
        className="animate-fade-up mx-auto mb-6 flex max-w-xs items-center justify-center gap-2"
        style={{ animationDelay: "100ms" }}
      >
        <Kbd className="text-base">
          <span className="text-xs">⌘</span>
        </Kbd>
        <span className="text-muted-foreground text-sm">+</span>
        <Kbd className="text-base">K</Kbd>
      </div>

      {/* Mock command palette preview */}
      <div
        className="bg-muted/50 animate-fade-up mx-auto max-w-xs overflow-hidden rounded-xl border"
        style={{ animationDelay: "200ms" }}
      >
        <div className="border-b px-3 py-2">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Search className="size-3" />
            <span>Search characters & conversations...</span>
          </div>
        </div>
        <div className="divide-y">
          <div className="flex items-center gap-2 px-3 py-2">
            <CharacterAvatar slug="nova" size="xs" />
            <span className="text-xs">Nova</span>
            <span className="text-muted-foreground ml-auto text-[10px]">
              Character
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <CharacterAvatar slug="luna" size="xs" />
            <span className="text-xs">Luna</span>
            <span className="text-muted-foreground ml-auto text-[10px]">
              Character
            </span>
          </div>
        </div>
      </div>

      <p
        className="text-muted-foreground animate-fade-up mt-4 text-center text-xs"
        style={{ animationDelay: "300ms" }}
      >
        Try it anytime - even after this tour!
      </p>

      <div className="mt-6 flex justify-center">
        <Button onClick={onNext} size="lg" className="group gap-2 px-6">
          Next: Customization
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}

function CustomizeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative px-6 pt-12 pb-6">
      <DialogHeader className="relative mb-6 items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
          <Star className="size-8 text-amber-500" />
        </div>
        <DialogTitle className="text-lg font-semibold">
          Make It Yours
        </DialogTitle>
        <DialogDescription className="text-sm">
          Personalize your experience with favorites and themes
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        {/* Favorites feature */}
        <div
          className="bg-muted/50 animate-fade-up flex items-center gap-4 rounded-lg px-4 py-3"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Star className="size-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Star Your Favorites</h3>
            <p className="text-muted-foreground text-xs">
              Click the star on any character for quick access
            </p>
          </div>
        </div>

        {/* Theme feature */}
        <div
          className="bg-muted/50 animate-fade-up flex items-center gap-4 rounded-lg px-4 py-3"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <div className="relative">
              <Sun className="text-primary size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="text-primary absolute top-0 left-0 size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium">Choose Your Theme</h3>
            <p className="text-muted-foreground text-xs">
              Switch between light and dark mode in settings
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={onNext} size="lg" className="group gap-2 px-6">
          Almost There!
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}

function ReadyStep({
  onComplete,
  isCompleting,
}: {
  onComplete: () => void;
  isCompleting: boolean;
}) {
  const tips = [
    { icon: Search, text: "⌘K to search" },
    { icon: Star, text: "Star your favorites" },
    { icon: Moon, text: "Theme in settings" },
    { icon: MessageCircle, text: "Chat with any persona" },
  ];

  return (
    <div className="relative px-6 pt-12 pb-6">
      {/* Celebration glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 size-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-2xl" />
        <div className="from-primary/10 absolute top-10 right-1/4 size-24 rounded-full bg-gradient-to-br to-transparent blur-2xl" />
      </div>

      <DialogHeader className="relative mb-6 items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
          <MessageCircle className="size-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <DialogTitle className="text-xl font-semibold">
          You&apos;re All Set!
        </DialogTitle>
        <DialogDescription className="text-sm">
          Quick reference for getting started
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-2">
        {tips.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div
              key={i}
              className={cn(
                "bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2.5",
                "animate-fade-up"
              )}
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="bg-background flex size-7 shrink-0 items-center justify-center rounded-md">
                <Icon className="text-muted-foreground size-3.5" />
              </div>
              <span className="text-xs">{tip.text}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={onComplete}
          size="lg"
          disabled={isCompleting}
          className="gap-2 px-6"
        >
          {isCompleting ? (
            "Starting..."
          ) : (
            <>
              <Sparkles className="size-4" />
              Start Chatting
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
