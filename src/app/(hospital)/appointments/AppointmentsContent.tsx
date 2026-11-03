"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AppointmentDateTimePicker,
  isStartsAtInFuture,
} from "@/components/AppointmentDateTimePicker";
import {
  PersonSelectField,
  type PersonSelectOption,
} from "@/components/PersonSelectField";
import { toast } from "sonner";
import { CalendarClock, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type AppointmentRow = {
  _id: string;
  startsAt: string;
  endsAt?: string;
  status: string;
  type?: string;
  notes?: string;
  patientId?: string;
  doctorProfileId?: string;
};

type PatientOption = {
  id: string;
  firstName?: string;
  email?: string;
};

export default function AppointmentsContent() {
  const { user } = useAuth();
  const isDoctor = isDoctorUser(user);
  const [list, setList] = useState<AppointmentRow[]>([]);
  const [doctors, setDoctors] = useState<
    Array<{ id: number; name: string; designation?: string }>
  >([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [doctorProfileId, setDoctorProfileId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", { credentials: "include" });
      if (res.ok) {
        setList(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetch("/api/doctors", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setDoctors(Array.isArray(d) ? d : []));
    if (isDoctor) {
      fetch("/api/users", { credentials: "include" })
        .then((r) => r.json())
        .then((u) => setPatients(Array.isArray(u) ? u : []));
    }
  }, [isDoctor]);

  const patientLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of patients) {
      map.set(p.id, p.firstName || p.email || p.id);
    }
    return map;
  }, [patients]);

  const doctorLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of doctors) {
      map.set(String(d.id), d.name);
    }
    return map;
  }, [doctors]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return list
      .filter(
        (a) =>
          a.status === "scheduled" &&
          new Date(a.startsAt).getTime() >= now - 3600000
      )
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      );
  }, [list]);

  const past = useMemo(() => {
    return list
      .filter((a) => !upcoming.includes(a))
      .sort(
        (a, b) =>
          new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
      );
  }, [list, upcoming]);

  const patientOptions: PersonSelectOption[] = useMemo(
    () =>
      patients.map((p) => ({
        value: p.id,
        label: p.firstName || p.email?.split("@")[0] || "Patient",
        description: p.email,
      })),
    [patients]
  );

  const doctorOptions: PersonSelectOption[] = useMemo(
    () =>
      doctors.map((d) => ({
        value: String(d.id),
        label: d.name,
        description: d.designation,
      })),
    [doctors]
  );

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStartsAtInFuture(startsAt)) {
      toast.error("Choose a date and time in the future.");
      return;
    }
    if (isDoctor && !patientId) {
      toast.error("Select a patient.");
      return;
    }
    if (!isDoctor && !doctorProfileId) {
      toast.error("Select a doctor.");
      return;
    }
    setSubmitting(true);
    try {
      const body = isDoctor
        ? { patientId, startsAt, notes, type: "video" }
        : {
            doctorProfileId: Number(doctorProfileId),
            startsAt,
            notes,
            type: "video",
          };
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Appointment scheduled");
        setNotes("");
        setStartsAt("");
        if (isDoctor) setPatientId("");
        else setDoctorProfileId("");
        await load();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Could not schedule");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id: string) => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (res.ok) {
      toast.success("Appointment cancelled");
      await load();
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center min-h-[40vh] bg-background">
        <Loader />
      </div>
    );
  }

  const scheduleForm = (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5 lg:sticky lg:top-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Schedule visit</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isDoctor
                ? "Invite a patient to a video visit."
                : "Pick a doctor and time that works for you."}
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium rounded-full bg-primary/15 text-primary px-2.5 py-1">
            Video · 30 min
          </span>
        </div>
      </div>
      <form onSubmit={book} className="space-y-4">
        {isDoctor ? (
          <PersonSelectField
            id="patient"
            label="Patient"
            placeholder="Select patient…"
            value={patientId}
            onValueChange={setPatientId}
            options={patientOptions}
            emptyMessage="No patients registered yet."
          />
        ) : (
          <PersonSelectField
            id="doctor"
            label="Doctor"
            placeholder="Select doctor…"
            value={doctorProfileId}
            onValueChange={setDoctorProfileId}
            options={doctorOptions}
            emptyMessage="No doctors available."
          />
        )}
        <AppointmentDateTimePicker
          id="starts"
          value={startsAt}
          onChange={setStartsAt}
          required
        />
        <div className="space-y-2">
          <Label htmlFor="apptNotes">Reason (optional)</Label>
          <Input
            id="apptNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Brief reason for visit…"
          />
        </div>
        <Button
          type="submit"
          disabled={
            submitting ||
            !isStartsAtInFuture(startsAt) ||
            (isDoctor ? !patientId : !doctorProfileId)
          }
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {submitting ? "Booking…" : "Book appointment"}
        </Button>
      </form>
    </section>
  );

  const lists = (
    <div className="space-y-8 min-w-0">
      <AppointmentSection
        title="Upcoming"
        rows={upcoming}
        onCancel={cancel}
        isDoctor={isDoctor}
        patientLabelById={patientLabelById}
        doctorLabelById={doctorLabelById}
        emptyHint={
          isDoctor
            ? "No upcoming visits. Schedule one for a patient using the form."
            : "No upcoming visits. Book a time with your doctor."
        }
      />
      <AppointmentSection
        title="Past & cancelled"
        rows={past}
        onCancel={cancel}
        isDoctor={isDoctor}
        patientLabelById={patientLabelById}
        doctorLabelById={doctorLabelById}
        emptyHint="Completed and cancelled visits will appear here."
      />
    </div>
  );

  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto space-y-8 bg-background text-foreground min-h-full">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <CalendarClock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Appointments</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {isDoctor
                ? "Today’s schedule and booking for your patients."
                : "Book and manage visits with your doctors."}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
        {scheduleForm}
        {lists}
      </div>
    </div>
  );
}

function AppointmentSection({
  title,
  rows,
  onCancel,
  isDoctor,
  patientLabelById,
  doctorLabelById,
  emptyHint,
}: {
  title: string;
  rows: AppointmentRow[];
  onCancel: (id: string) => void;
  isDoctor: boolean;
  patientLabelById: Map<string, string>;
  doctorLabelById: Map<string, string>;
  emptyHint: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs font-medium tabular-nums rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
          {rows.length}
        </span>
      </div>
      {!rows.length ? (
        <EmptyState message={emptyHint} />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {rows.map((a) => (
            <AppointmentListItem
              key={a._id}
              appointment={a}
              onCancel={onCancel}
              peerLabel={
                isDoctor
                  ? patientLabelById.get(String(a.patientId)) ||
                    "Patient"
                  : doctorLabelById.get(String(a.doctorProfileId)) ||
                    "Doctor"
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-center text-sm text-muted-foreground py-10 px-4 border border-dashed border-border rounded-xl bg-muted/20">
      {message}
    </p>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: "bg-primary/15 text-primary",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/15 text-destructive",
    no_show: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  };
  return (
    <span
      className={cn(
        "inline-flex text-xs font-medium capitalize rounded-full px-2 py-0.5",
        styles[status] || "bg-muted text-muted-foreground"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function AppointmentListItem({
  appointment: a,
  onCancel,
  peerLabel,
}: {
  appointment: AppointmentRow;
  onCancel: (id: string) => void;
  peerLabel: string;
}) {
  const start = new Date(a.startsAt);
  const near =
    a.status === "scheduled" &&
    Math.abs(start.getTime() - Date.now()) < 30 * 60000;

  const dateLine = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeLine = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <li className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold truncate">{peerLabel}</p>
          <StatusBadge status={a.status} />
        </div>
        <p className="text-sm text-foreground">
          {dateLine}
          <span className="text-muted-foreground"> · </span>
          {timeLine}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {(a.type || "video").replace("_", " ")} visit
        </p>
        {a.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{a.notes}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-2 sm:flex-col sm:items-stretch md:flex-row">
        {near && a.type === "video" && a.status === "scheduled" && (
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href="/chat">
              <Video className="h-4 w-4 mr-1.5" />
              Join visit
            </Link>
          </Button>
        )}
        {a.status === "scheduled" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onCancel(a._id)}
          >
            Cancel
          </Button>
        )}
      </div>
    </li>
  );
}
