"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import { ReportList } from "@/components/ReportList";
import { PersonSelectField } from "@/components/PersonSelectField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Reports = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [testName, setTestName] = useState("");
  const [testResult, setTestResult] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("final");
  const [refreshKey, setRefreshKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isDoctor = isDoctorUser(user);

  useEffect(() => {
    if (!isDoctor) return;
    fetch("/api/users", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setPatients(Array.isArray(data) ? data : []));
  }, [isDoctor]);

  useEffect(() => {
    if (!patientId) return;
    const p = patients.find((x) => String(x.id) === patientId);
    if (p) {
      setPatientName(
        p.firstName || p.username || p.email?.split("@")[0] || ""
      );
    }
  }, [patientId, patients]);

  const patientOptions = useMemo(
    () =>
      patients.map((p) => ({
        value: p.id,
        label: p.firstName || p.username || p.email?.split("@")[0] || "Patient",
        description: p.email,
      })),
    [patients]
  );

  const submitHandle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          patientName,
          patientId,
          testName,
          testResult,
          notes,
          status,
        }),
      });

      if (res.ok) {
        setRefreshKey((k) => k + 1);
        setPatientId("");
        setPatientName("");
        setTestName("");
        setTestResult("");
        setNotes("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto space-y-8 bg-background text-foreground min-h-full">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold">Reports</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          {isDoctor
            ? "Review and submit patient lab results across your caseload."
            : "View and download your lab test results."}
        </p>
      </header>

      {isDoctor && (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-xl">
          <h2 className="text-lg font-semibold mb-1">Submit lab report</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Select a patient from your roster — no manual IDs required.
          </p>
          <form onSubmit={submitHandle} className="space-y-4">
            <PersonSelectField
              id="patient"
              label="Patient"
              placeholder="Select patient…"
              value={patientId}
              onValueChange={setPatientId}
              options={patientOptions}
              emptyMessage="No patients registered yet."
            />
            <div className="space-y-2">
              <Label htmlFor="patientName">Display name on report</Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testName">Test name</Label>
              <Input
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g. Complete Blood Count"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testResult">Test result</Label>
              <textarea
                id="testResult"
                value={testResult}
                onChange={(e) => setTestResult(e.target.value)}
                placeholder="Enter result details…"
                rows={4}
                required
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Internal notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="final">Final</option>
              </select>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {submitting ? "Submitting…" : "Submit report"}
            </Button>
          </form>
        </section>
      )}

      <section className="border-t border-border pt-8">
        <ReportList
          key={refreshKey}
          hideTitle
          showSearch
          title="Lab test reports"
        />
      </section>
    </div>
  );
};

export default Reports;
