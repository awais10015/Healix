"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import selectedUserContext from "@/app/context/selectedUserContext";
import doctorContext from "@/app/context/doctorContext";
import Loader from "@/components/Loader";
import { Input } from "@/components/ui/input";
import {
  DoctorBrowseCard,
  PatientChatCard,
} from "./DoctorCard";

function DoctorsSearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label="Search"
      />
    </div>
  );
}

function PageShell({ title, subtitle, query, onQueryChange, searchPlaceholder, children }) {
  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        <DoctorsSearchBar
          value={query}
          onChange={onQueryChange}
          placeholder={searchPlaceholder}
        />
      </header>
      {children}
    </div>
  );
}

function EmptyMessage({ message }) {
  return (
    <p className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl">
      {message}
    </p>
  );
}

const Doctor = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const { setSelectedUser } = useContext(selectedUserContext);
  const { doctor, setDoctor } = useContext(doctorContext);

  const isDoctor = isDoctorUser(user);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const [docRes, userRes] = await Promise.all([
          fetch("/api/doctors"),
          fetch("/api/users"),
        ]);
        if (!docRes.ok) throw new Error("Failed to load doctors");
        const docData = await docRes.json();
        setDoctors(Array.isArray(docData) ? docData : []);
        if (userRes.ok) {
          const userData = await userRes.json();
          setPatients(Array.isArray(userData) ? userData : []);
        }
      } catch {
        setFetchError("Could not load doctors. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(
      (doc) =>
        doc.name?.toLowerCase().includes(q) ||
        doc.designation?.toLowerCase().includes(q)
    );
  }, [doctors, query]);

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const haystack = [p.username, p.firstName, p.lastName, p.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [patients, query]);

  const handleClick = (docId, doc) => {
    handleChat(docId);
    setSelectedUser(doc);
    setDoctor(docId);
    router.push(`/chat?doctorId=${doc.id}`);
  };

  const handleChat = async (docId) => {
    if (isDoctor) {
      if (!doctor || !docId) {
        console.error("Missing participant IDs");
        return;
      }
      const participants = [doctor, docId];
      try {
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participants }),
        });
      } catch (error) {
        console.error("Chat creation failed:", error);
      }
    } else {
      if (!docId || !user?.id) {
        console.error("Missing participant IDs");
        return;
      }
      const participants = [docId, user.id];
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participants }),
        });
        if (!res.ok) throw new Error("Failed to create or fetch chat");
      } catch (error) {
        console.error("Chat creation failed:", error);
      }
    }
  };

  const handleAdminPatientChat = (patientId, patient) => {
    handleChat(patientId);
    setSelectedUser(patient);
    router.push(`/chat?doctorId=${doctor}`);
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center min-h-[40vh]">
        <Loader />
      </div>
    );
  }

  if (fetchError) {
    return (
      <PageShell
        title="Doctors"
        subtitle=""
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search by name or specialty…"
      >
        <EmptyMessage message={fetchError} />
      </PageShell>
    );
  }

  if (isDoctor && doctor) {
    return (
      <PageShell
        title="Patients"
        subtitle="Select a patient to start or continue a conversation."
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search patients by name or email…"
      >
        {patients.length === 0 ? (
          <EmptyMessage message="No patients registered yet." />
        ) : filteredPatients.length === 0 ? (
          <EmptyMessage message={`No patients match "${query.trim()}".`} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientChatCard
                key={patient._id || patient.id}
                patient={patient}
                onChat={handleAdminPatientChat}
                showProfileLink
              />
            ))}
          </div>
        )}
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Doctors"
      subtitle="Browse our specialists and start a secure chat consultation."
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder="Search by name or specialty…"
    >
      {doctors.length === 0 ? (
        <EmptyMessage message="No doctors available." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyMessage message={`No doctors match "${query.trim()}".`} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <DoctorBrowseCard
              key={doc.id}
              doc={doc}
              onChat={handleClick}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default Doctor;
