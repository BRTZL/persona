"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { CharacterAvatar } from "@/components/character-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllCharacters } from "@/lib/characters";
import { useGoogleLogin, useUser } from "@/queries";

const STAGGER_CLASSES = [
  "stagger-1",
  "stagger-2",
  "stagger-3",
  "stagger-4",
  "stagger-5",
  "stagger-6",
  "stagger-7",
  "stagger-8",
];

function Header() {
  const { data: user, isLoading } = useUser();
  const googleLogin = useGoogleLogin();

  return (
    <header className="animate-fade-in border-border/50 bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
            <Sparkles className="text-primary size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Persona</span>
        </Link>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
          ) : user ? (
            <Button asChild size="lg" className="gap-2">
              <Link href="/chat">
                Open App
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => googleLogin.mutate()}
              disabled={googleLogin.isPending}
              className="gap-2"
            >
              {googleLogin.isPending ? (
                <>
                  <svg
                    className="size-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="currentColor"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const { data: user } = useUser();
  const googleLogin = useGoogleLogin();

  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 pt-16">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float bg-primary/10 absolute -top-40 -left-40 size-80 rounded-full blur-[100px]" />
        <div
          className="animate-float bg-primary/5 absolute -right-40 -bottom-40 size-96 rounded-full blur-[120px]"
          style={{ animationDelay: "-3s" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="animate-fade-up border-border/50 bg-card/50 text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur-sm">
          <Sparkles className="text-primary size-4" />
          <span>8 unique AI personalities to chat with</span>
        </div>

        <h1 className="animate-fade-up stagger-1 mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Chat with AI that
          <br />
          <span className="gradient-text">actually has personality</span>
        </h1>

        <p className="animate-fade-up stagger-2 text-muted-foreground mx-auto mb-10 max-w-2xl text-lg sm:text-xl">
          From empathetic listeners to sharp thinkers, creative muses to elite
          coaches. Each persona brings a unique voice, expertise, and
          perspective to every conversation.
        </p>

        <div className="animate-fade-up stagger-3 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {user ? (
            <Button asChild size="lg" className="glow gap-2 px-8">
              <Link href="/chat">
                Start Chatting
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => googleLogin.mutate()}
              disabled={googleLogin.isPending}
              className="glow gap-2 px-8"
            >
              {googleLogin.isPending ? (
                "Signing in..."
              ) : (
                <>
                  Get Started Free
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          )}
          <Button variant="outline" size="lg" asChild className="gap-2">
            <a href="#characters">
              <MessageCircle className="size-4" />
              Meet the Personas
            </a>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="animate-fade-in stagger-4 absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="text-muted-foreground flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="from-muted-foreground/50 h-8 w-px bg-linear-to-b to-transparent" />
        </div>
      </div>
    </section>
  );
}

function CharacterCard({
  character,
  index,
}: {
  character: ReturnType<typeof getAllCharacters>[number];
  index: number;
}) {
  return (
    <Link href={`/chat?character=${character.slug}`}>
      <Card
        className={`character-card animate-scale-in group border-border/50 bg-card/50 relative h-full cursor-pointer overflow-hidden p-0 backdrop-blur-sm ${STAGGER_CLASSES[index]}`}
      >
        {/* Hover glow effect */}
        <div className="from-primary/5 pointer-events-none absolute inset-0 rounded-lg bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex flex-col p-5">
          {/* Avatar and name */}
          <div className="mb-4 flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="ring-border/50 ring-offset-background group-hover:ring-primary/50 rounded-full ring-2 ring-offset-2 transition-all duration-300">
                <CharacterAvatar slug={character.slug} size="xl" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-lg font-semibold tracking-tight">
                {character.name}
              </h3>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {character.description}
              </p>
            </div>
          </div>

          {/* Sample message */}
          <div className="border-border/30 bg-muted/30 mt-auto rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Try asking:</p>
            <p className="mt-1 text-sm font-medium">
              &ldquo;{character.kickstartMessages[0]}&rdquo;
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function CharactersSection() {
  const characters = getAllCharacters();

  return (
    <section id="characters" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="animate-fade-up mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Meet the Personas
          </h2>
          <p className="animate-fade-up stagger-1 text-muted-foreground mx-auto max-w-2xl">
            Each AI personality has been carefully crafted with unique traits,
            expertise, and communication styles. Find the perfect conversation
            partner for any situation.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {characters.map((character, index) => (
            <CharacterCard
              key={character.slug}
              character={character}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-border/50 border-t px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex size-6 items-center justify-center rounded-md">
            <Sparkles className="text-primary size-3" />
          </div>
          <span className="text-sm font-medium">Persona</span>
        </div>
        <p className="text-muted-foreground text-sm">
          AI conversations with personality. Built with care.
        </p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="noise-overlay relative min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <CharactersSection />
      </main>
      <Footer />
    </div>
  );
}
