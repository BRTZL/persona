"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Command,
  MessageCircle,
  Moon,
  Sparkles,
  Star,
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
import { cn } from "@/lib/utils";
import { useCompleteOnboarding, useUser } from "@/queries";

type OnboardingStep = 0 | 1 | 2;

const FEATURED_PERSONAS = [
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
] as const;

const TIPS = [
  { icon: Command, text: "⌘K for quick actions" },
  { icon: Star, text: "Star your favorites" },
  { icon: Moon, text: "Theme in settings" },
] as const;

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
    if (step < 2) {
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
        className="overflow-hidden p-0 sm:max-w-lg"
      >
        {/* Progress indicator */}
        <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {[0, 1, 2].map((i) => (
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
          {step === 2 && (
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
        <DialogDescription className="mt-2 text-sm leading-relaxed">
          Meet your AI companions, each with unique personalities and expertise.
          They&apos;re here to help, inspire, and chat.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-8 flex justify-center">
        <Button onClick={onNext} size="lg" className="group gap-2 px-6">
          Get Started
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
          Meet the Personas
        </DialogTitle>
        <DialogDescription className="text-sm">
          Each AI has a distinct personality. Pick one to start.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3">
        {FEATURED_PERSONAS.map((persona, i) => (
          <div
            key={persona.slug}
            className={cn(
              "group relative cursor-default overflow-hidden rounded-xl border p-4 transition-all",
              "hover:border-primary/50 hover:shadow-md",
              "animate-fade-up"
            )}
            style={{ animationDelay: `${i * 75}ms` }}
          >
            {/* Gradient background on hover */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100",
                persona.color
              )}
            />

            <div className="relative flex flex-col items-center text-center">
              <div className="ring-background mb-3 rounded-full ring-2 transition-transform group-hover:scale-105">
                <CharacterAvatar slug={persona.slug} size="lg" />
              </div>
              <h3 className="font-medium">{persona.name}</h3>
              <p className="text-muted-foreground text-xs">{persona.tagline}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground mt-4 text-center text-xs">
        + 4 more personas to discover
      </p>

      <div className="mt-6 flex justify-center">
        <Button onClick={onNext} size="lg" className="group gap-2 px-6">
          Next
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
          You&apos;re all set!
        </DialogTitle>
        <DialogDescription className="text-sm">
          Here are some quick tips to get started
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        {TIPS.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div
              key={i}
              className={cn(
                "bg-muted/50 flex items-center gap-3 rounded-lg px-4 py-3",
                "animate-fade-up"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="bg-background flex size-8 items-center justify-center rounded-md">
                <Icon className="text-muted-foreground size-4" />
              </div>
              <span className="text-sm">{tip.text}</span>
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
