"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import { AuthBusyOverlay } from "@/components/AuthBusyOverlay";

export type AccountRole = "patient" | "doctor";
export default function SignUpForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountRole, setAccountRole] = useState<AccountRole>("patient");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const busy = loading || redirecting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role: accountRole,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign up failed");
        return;
      }
      setRedirecting(true);
      await refresh();
      const dest = isDoctorUser(data.user) ? "/select-doctor" : "/dashboard";
      window.location.assign(dest);
    } catch {
      setError("Sign up failed");
    } finally {
      if (!redirecting) setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto py-10 md:py-16 px-6 w-full">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative">
        {busy && (
          <AuthBusyOverlay
            message={redirecting ? "Taking you to your dashboard…" : "Creating account…"}
          />
        )}
        <h1 className="text-3xl font-bold mb-2">Create account</h1>
        <p className="text-muted-foreground mb-8">Join Healix to manage your care.</p>
        <form onSubmit={handleSubmit} className={`space-y-4 ${busy ? "pointer-events-none opacity-60" : ""}`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
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
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium leading-none">Account type</legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="accountRole"
                value="patient"
                checked={accountRole === "patient"}
                onChange={() => setAccountRole("patient")}
                className="accent-primary"
              />
              Patient
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="accountRole"
                value="doctor"
                checked={accountRole === "doctor"}
                onChange={() => setAccountRole("doctor")}
                className="accent-primary"
              />
              Doctor
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Doctors choose a clinical profile after sign-up to use chat and patient tools.
          </p>
        </fieldset>
        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {loading && !redirecting ? "Creating account…" : redirecting ? "Redirecting…" : "Sign up"}
        </Button>
      </form>
      </div>
      <p className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
