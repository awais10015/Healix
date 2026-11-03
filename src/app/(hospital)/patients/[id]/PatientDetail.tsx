"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageSquare, Video } from "lucide-react";

export default function PatientDetail({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [data, setData] = useState<{
    user: Record<string, unknown>;
    profile: Record<string, unknown> | null;
    reports: Array<Record<string, unknown>>;
  } | null>(null);
  const [meetings, setMeetings] = useState<Array<Record<string, unknown>>>([]);
  const [notes, setNotes] = useState<Array<Record<string, unknown>>>([]);
  const [noteBody, setNoteBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"reports" | "meetings" | "notes">("reports");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [detailRes, meetRes, notesRes] = await Promise.all([
          fetch(`/api/patients/${patientId}`, { credentials: "include" }),
          fetch("/api/meeting/active", { credentials: "include" }),
          fetch(`/api/clinical-notes?patientId=${patientId}`, {
            credentials: "include",
          }),
        ]);
        if (!detailRes.ok) throw new Error("Patient not found");
        const detail = await detailRes.json();
        setData(detail);
        if (meetRes.ok) {
          const all = await meetRes.json();
          const filtered = (Array.isArray(all) ? all : []).filter((m) =>
            (m.participants || []).map(String).includes(String(patientId))
          );
          setMeetings(filtered);
        }
        if (notesRes.ok) {
          setNotes(await notesRes.json());
        }
      } catch {
        setError("Could not load patient record.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;
    const res = await fetch("/api/clinical-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ patientId, body: noteBody }),
    });
    if (res.ok) {
      const created = await res.json();
      setNotes((n) => [created, ...n]);
      setNoteBody("");
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center min-h-[40vh]">
        <Loader />
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="p-10 max-w-3xl mx-auto">
        <p className="text-muted-foreground">{error || "Not found"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const u = data.user;
  const displayName =
    (u.firstName as string) ||
    (u.username as string) ||
    (u.email as string) ||
    "Patient";

  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/doctors")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Patients
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold truncate">{displayName}</h1>
          <p className="text-sm text-muted-foreground truncate">
            {(u.email as string) || ""} · ID {patientId}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="default">
            <Link href={`/chat?patientId=${patientId}`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Link>
          </Button>
        </div>
      </div>

      {data.profile && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm grid sm:grid-cols-2 gap-2">
          <p>
            <span className="text-muted-foreground">Blood type:</span>{" "}
            {(data.profile.bloodType as string) || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Allergies:</span>{" "}
            {Array.isArray(data.profile.allergies)
              ? (data.profile.allergies as string[]).join(", ") || "—"
              : "—"}
          </p>
        </div>
      )}

      <div className="flex gap-2 border-b border-border pb-2">
        {(
          [
            ["reports", "Reports"],
            ["meetings", "Meetings"],
            ["notes", "Clinical notes"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={tab === key ? "default" : "ghost"}
            onClick={() => setTab(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === "reports" && (
        <div className="mt-4 space-y-3">
          {data.reports.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reports yet.</p>
          ) : (
            data.reports.map((r) => (
              <div
                key={String(r._id)}
                className="rounded-lg border border-border p-4 bg-card"
              >
                <p className="font-medium">{String(r.testName || "Test")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {String(r.testResult || "")}
                </p>
                {r.status != null && r.status !== "" && (
                  <p className="text-xs mt-2 capitalize text-primary">
                    {String(r.status)}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "meetings" && (
        <div className="mt-4 space-y-3">
          {meetings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No meeting history.</p>
          ) : (
            meetings.map((m) => (
              <div
                key={String(m._id || m.meetingId)}
                className="rounded-lg border border-border p-4 bg-card flex justify-between items-center gap-4"
              >
                <div>
                  <p className="font-medium">
                    {String(m.description || "Video visit")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.createdAt
                      ? new Date(String(m.createdAt)).toLocaleString()
                      : ""}
                  </p>
                </div>
                {m.meetingId != null && m.meetingId !== "" && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/meeting/${String(m.meetingId)}`}>
                      <Video className="h-4 w-4 mr-1" />
                      Open
                    </Link>
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "notes" && (
        <div className="mt-4 space-y-4">
          <form onSubmit={submitNote} className="space-y-3 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="note">Add note (doctor only)</Label>
              <textarea
                id="note"
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Clinical observation…"
              />
            </div>
            <Button type="submit">Save note</Button>
          </form>
          <ul className="space-y-3">
            {notes.map((n) => (
              <li
                key={String(n._id)}
                className="rounded-lg border border-border p-4 bg-muted/30 text-sm"
              >
                <p>{String(n.body)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {n.createdAt
                    ? new Date(String(n.createdAt)).toLocaleString()
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
