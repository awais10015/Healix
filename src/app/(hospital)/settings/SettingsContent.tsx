"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsContent() {
  const { user, refresh } = useAuth();
  const isDoctor = isDoctorUser(user);
  const isPatient = user?.role === "patient";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photo, setPhoto] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [docName, setDocName] = useState("");
  const [docDesignation, setDocDesignation] = useState("");
  const [docImage, setDocImage] = useState("");
  const [docMsg, setDocMsg] = useState("");

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setPhoto(user?.photo || "");
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ firstName, lastName, photo }),
      });
      if (res.ok) {
        setProfileMsg("Profile updated.");
        await refresh();
      } else {
        setProfileMsg("Could not update profile.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setPasswordMsg("Password changed.");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const data = await res.json().catch(() => ({}));
        setPasswordMsg(data.error || "Could not change password.");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const addDoctorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocMsg("");
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: docName,
        designation: docDesignation,
        image: docImage,
      }),
    });
    if (res.ok) {
      setDocMsg("Doctor profile added to directory.");
      setDocName("");
      setDocDesignation("");
      setDocImage("");
    } else {
      setDocMsg("Could not add doctor profile.");
    }
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-2xl mx-auto space-y-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold">Account settings</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Update your profile and security preferences.
        </p>
      </header>

      {isPatient && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-2">Health profile</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Allergies, medications, and emergency contact.
          </p>
          <Button asChild variant="outline">
            <Link href="/settings/health">Manage health profile</Link>
          </Button>
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL</Label>
            <Input
              id="photo"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save profile"}
          </Button>
          {profileMsg && (
            <p className="text-sm text-muted-foreground">{profileMsg}</p>
          )}
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Password</h2>
        <form onSubmit={savePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={savingPassword}>
            {savingPassword ? "Updating…" : "Change password"}
          </Button>
          {passwordMsg && (
            <p className="text-sm text-muted-foreground">{passwordMsg}</p>
          )}
        </form>
      </section>

      {isDoctor && (
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Doctor directory</h2>
          <p className="text-sm text-muted-foreground">
            Add a specialist profile to the hospital directory.
          </p>
          <form onSubmit={addDoctorProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="docName">Name</Label>
              <Input
                id="docName"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="docDesignation">Designation</Label>
              <Input
                id="docDesignation"
                value={docDesignation}
                onChange={(e) => setDocDesignation(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="docImage">Image URL</Label>
              <Input
                id="docImage"
                value={docImage}
                onChange={(e) => setDocImage(e.target.value)}
              />
            </div>
            <Button type="submit">Add doctor</Button>
            {docMsg && (
              <p className="text-sm text-muted-foreground">{docMsg}</p>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
