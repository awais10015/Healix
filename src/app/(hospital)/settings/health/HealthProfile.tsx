"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function HealthProfile() {
  const [loading, setLoading] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/patients/me", { credentials: "include" });
        if (res.ok) {
          const p = await res.json();
          setDateOfBirth(p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : "");
          setBloodType(p.bloodType || "");
          setAllergies(Array.isArray(p.allergies) ? p.allergies.join(", ") : "");
          setMedications(
            Array.isArray(p.medications) ? p.medications.join(", ") : ""
          );
          setEmergencyName(p.emergencyContact?.name || "");
          setEmergencyPhone(p.emergencyContact?.phone || "");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/patients/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dateOfBirth: dateOfBirth || undefined,
          bloodType,
          allergies: allergies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          medications: medications
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          emergencyContact: {
            name: emergencyName,
            phone: emergencyPhone,
          },
        }),
      });
      setMessage(res.ok ? "Health profile saved." : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-xl mx-auto space-y-6">
      <Button asChild variant="ghost" size="sm" className="px-0">
        <Link href="/settings">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Settings
        </Link>
      </Button>
      <header>
        <h1 className="text-2xl font-semibold">Health profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Information shared with your care team.
        </p>
      </header>
      <form onSubmit={save} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blood">Blood type</Label>
          <Input
            id="blood"
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            placeholder="e.g. O+"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies (comma-separated)</Label>
          <Input
            id="allergies"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meds">Medications (comma-separated)</Label>
          <Input
            id="meds"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ecName">Emergency contact name</Label>
          <Input
            id="ecName"
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ecPhone">Emergency contact phone</Label>
          <Input
            id="ecPhone"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>
    </div>
  );
}
