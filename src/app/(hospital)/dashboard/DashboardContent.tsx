"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import { MessageSquare, Stethoscope, Users, Calendar, FileText } from "lucide-react";
import { ReportList } from "@/components/ReportList";

export default function DashboardContent() {
  const { user, isLoading } = useAuth();
  const name =
    user?.firstName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "there";
  const isDoctor = isDoctorUser(user);
  const [stats, setStats] = useState<{
    openChats: number;
    appointmentsToday: number;
    reportsThisWeek: number;
  } | null>(null);

  useEffect(() => {
    if (!isDoctor) return;
    fetch("/api/analytics/summary", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d));
  }, [isDoctor]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[40vh]">
        Loading…
      </div>
    );
  }

  if (isDoctor) {
    return (
      <div className="p-6 md:p-10 w-full max-w-6xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl font-semibold">Welcome, {name}</h1>
          <p className="text-muted-foreground mt-2">
            Your clinical dashboard — message patients and review lab results
            across your caseload.
          </p>
        </header>

        {stats && (
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard
              icon={MessageSquare}
              label="Open chats"
              value={stats.openChats}
            />
            <StatCard
              icon={Calendar}
              label="Appointments today"
              value={stats.appointmentsToday}
            />
            <StatCard
              icon={FileText}
              label="Reports this week"
              value={stats.reportsThisWeek}
            />
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/chat"
            className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition"
          >
            <div className="p-3 rounded-full bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Message patients</h2>
              <p className="text-sm text-muted-foreground">
                Open chat and pick a patient thread
              </p>
            </div>
          </Link>
          <Link
            href="/doctors"
            className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition"
          >
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">View patients</h2>
              <p className="text-sm text-muted-foreground">
                Browse registered patients and start a session
              </p>
            </div>
          </Link>
          <Link
            href="/appointments"
            className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition"
          >
            <div className="p-3 rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Appointments</h2>
              <p className="text-sm text-muted-foreground">
                Today&apos;s schedule and booking
              </p>
            </div>
          </Link>
        </div>

        <section>
          <ReportList
            title="Patient reports"
            compact
            showViewAllLink
          />
        </section>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-semibold">Welcome, {name}</h1>
        <p className="text-muted-foreground mt-2">
          Your Healix hospital dashboard — message your care team and view lab
          reports.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/chat"
          className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition"
        >
          <div className="p-3 rounded-full bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Open Chat</h2>
            <p className="text-sm text-muted-foreground">
              Message doctors on your care team
            </p>
          </div>
        </Link>
        <Link
          href="/doctors"
          className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition"
        >
          <div className="p-3 rounded-full bg-primary/10">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Consult a Doctor</h2>
            <p className="text-sm text-muted-foreground">
              Browse specialists and start a session
            </p>
          </div>
        </Link>
        <Link
          href="/appointments"
          className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition"
        >
          <div className="p-3 rounded-full bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Appointments</h2>
            <p className="text-sm text-muted-foreground">
              Book or manage upcoming visits
            </p>
          </div>
        </Link>
      </div>

      <section>
        <ReportList title="My reports" compact showViewAllLink />
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
