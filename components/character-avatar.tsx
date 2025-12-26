"use client";

import Image from "next/image";
import { getCharacter } from "@/lib/characters";
import { cn } from "@/lib/utils";

type CharacterAvatarProps = {
  slug: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  xs: "size-5",
  sm: "size-6",
  md: "size-10",
  lg: "size-14",
  xl: "size-16",
} as const;

const imageSizes = {
  xs: 20,
  sm: 24,
  md: 40,
  lg: 56,
  xl: 64,
} as const;

export function CharacterAvatar({
  slug,
  size = "sm",
  className,
}: CharacterAvatarProps) {
  const character = getCharacter(slug);

  if (!character) {
    return (
      <div
        className={cn(
          "bg-muted shrink-0 rounded-full",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={character.avatarUrl}
        alt={character.name}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="size-full object-cover object-top"
      />
    </div>
  );
}
