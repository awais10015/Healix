"use client";

import Loader from "@/components/Loader";

export function AuthBusyOverlay({
  message = "Please wait…",
}: {
  message?: string;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-card/90 backdrop-blur-sm">
      <Loader />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
