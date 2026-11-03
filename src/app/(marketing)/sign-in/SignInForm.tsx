"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import { AuthBusyOverlay } from "@/components/AuthBusyOverlay";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const busy = loading || redirecting;

  const redirect =
    searchParams.get("redirect_url") ||
    searchParams.get("redirect") ||
    "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign in failed");
        return;
      }
      setRedirecting(true);
      await refresh();
      const destination = isDoctorUser(data.user)
        ? "/select-doctor"
        : redirect;
      window.location.assign(destination);
    } catch {
      setError("Sign in failed");
    } finally {
      if (!redirecting) setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto py-10 md:py-16 px-6 w-full">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative">
        {busy && (
          <AuthBusyOverlay message={redirecting ? "Opening your portal…" : "Signing in…"} />
        )}
        <h1 className="text-3xl font-bold mb-2">Sign in</h1>
        <p className="text-muted-foreground mb-8">
          Access your Healix hospital dashboard.
        </p>
        <form onSubmit={handleSubmit} className={`space-y-4 ${busy ? "pointer-events-none opacity-60" : ""}`}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {loading && !redirecting ? "Signing in…" : redirecting ? "Redirecting…" : "Sign in"}
        </Button>
      </form>
      </div>
      <p className="mt-6 text-center text-sm">
        No account?{" "}
        <Link href="/sign-up" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
