"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import { FileText, Search } from "lucide-react";
import Loader from "@/components/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";

export type ReportRecord = {
  _id: string;
  patientName: string;
  patientId: string;
  testName: string;
  testResult: string;
  createdAt?: string;
};

async function getBase64FromUrl(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise<string | ArrayBuffer | null>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export async function downloadReportPdf(report: ReportRecord) {
  const doc = new jsPDF();
  const logo = await getBase64FromUrl("/logo.png");
  if (logo) {
    doc.addImage(logo as string, "PNG", 15, 10, 60, 20);
  }
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Healix Hospital", 150, 20, { align: "right" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Lab Test Report", 150, 30, { align: "right" });
  doc.setLineWidth(0.5);
  doc.line(15, 45, 195, 45);
  let y = 60;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Information", 15, y);
  doc.setFont("helvetica", "normal");
  y += 10;
  doc.text(`Patient Name: ${report.patientName}`, 15, y);
  y += 8;
  doc.text(`Patient ID: ${report.patientId}`, 15, y);
  y += 8;
  doc.text(`Test Name: ${report.testName}`, 15, y);
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Test Result", 15, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  const splitResult = doc.splitTextToSize(report.testResult, 170);
  doc.text(splitResult, 15, y);
  doc.save(`report-${report.patientId}.pdf`);
}

function formatReportDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

type ReportListProps = {
  title?: string;
  hideTitle?: boolean;
  compact?: boolean;
  showViewAllLink?: boolean;
  showSearch?: boolean;
};

export function ReportList({
  title = "Lab Test Reports",
  hideTitle = false,
  compact = false,
  showViewAllLink = false,
  showSearch = false,
}: ReportListProps) {
  const { user } = useAuth();
  const isDoctor = isDoctorUser(user);

  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => {
      const haystack = [r.testName, r.patientName, isDoctor ? r.patientId : ""]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [reports, query, isDoctor]);

  const displayReports = compact
    ? filteredReports.slice(0, 6)
    : filteredReports;

  const openReport = (report: ReportRecord) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  return (
    <div
      className={
        compact ? "w-full text-left" : "w-full text-left space-y-6"
      }
    >
      {!hideTitle && (
        <h2 className={`font-semibold ${compact ? "text-xl mb-4" : "text-xl"}`}>
          {title}
        </h2>
      )}

      {showSearch && !compact && (
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by test or patient name…"
            className="pl-9"
            aria-label="Search reports"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : displayReports.length === 0 ? (
        <p className="text-muted-foreground py-12 border border-dashed border-border rounded-xl text-center">
          {query.trim()
            ? `No reports match "${query.trim()}".`
            : "No reports found for your account yet."}
        </p>
      ) : (
        <div
          className={`grid grid-cols-1 ${
            compact
              ? "gap-4 sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3 gap-6"
          }`}
        >
          {displayReports.map((report) => {
            const dateLabel = formatReportDate(report.createdAt);
            return (
              <button
                key={report._id}
                type="button"
                onClick={() => openReport(report)}
                className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow text-left flex flex-col gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground leading-tight">
                      {report.testName}
                    </h3>
                    {dateLabel && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {dateLabel}
                      </p>
                    )}
                  </div>
                </div>
                {isDoctor && (
                  <>
                    <p className="text-sm text-muted-foreground truncate">
                      Patient: {report.patientName}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      ID: {report.patientId}
                    </p>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showViewAllLink && reports.length > 6 && (
        <Link
          href="/reports"
          className="text-primary hover:underline mt-4 inline-block font-medium"
        >
          View all reports
        </Link>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedReport(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto gap-5 sm:gap-6">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedReport.testName}</DialogTitle>
                {formatReportDate(selectedReport.createdAt) && (
                  <p className="text-sm text-muted-foreground">
                    {formatReportDate(selectedReport.createdAt)}
                  </p>
                )}
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">Patient</p>
                  <p className="text-muted-foreground">
                    {selectedReport.patientName}
                  </p>
                </div>
                {isDoctor && (
                  <div>
                    <p className="font-medium text-foreground">Patient ID</p>
                    <p className="text-muted-foreground font-mono text-xs break-all">
                      {selectedReport.patientId}
                    </p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">Result</p>
                  <p className="text-muted-foreground whitespace-pre-line mt-1">
                    {selectedReport.testResult}
                  </p>
                </div>
              </div>
              <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:items-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => downloadReportPdf(selectedReport)}
                >
                  Download PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
