"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackClassName?: string;
  fallbackText?: string;
};

/** Safe avatar: local paths use next/image; remote URLs use img (no next.config host required). */
export function UserAvatar({
  src,
  alt = "",
  size = 40,
  className,
  fallbackClassName,
  fallbackText = "?",
}: UserAvatarProps) {
  const trimmed = src?.trim();
  const isLocal =
    trimmed &&
    (trimmed.startsWith("/") || trimmed.startsWith("data:"));

  if (trimmed && isLocal) {
    return (
      <Image
        src={trimmed}
        alt={alt}
        width={size}
        height={size}
        className={cn("rounded-full object-cover shrink-0", className)}
      />
    );
  }

  if (trimmed && (trimmed.startsWith("http://") || trimmed.startsWith("https://"))) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={trimmed}
        alt={alt}
        width={size}
        height={size}
        className={cn("rounded-full object-cover shrink-0", className)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
        fallbackClassName
      )}
      style={{ width: size, height: size }}
      aria-hidden={!alt}
    >
      {fallbackText}
    </div>
  );
}
