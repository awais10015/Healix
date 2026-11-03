"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import doctorContext from "@/app/context/doctorContext";
import Loader from "@/components/Loader";
import { Input } from "@/components/ui/input";
import { DoctorIdentityCard } from "../doctors/DoctorCard";

function EmptyMessage({ message }: { message: string }) {
  return (
    <p className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl">
      {message}
    </p>
  );
}

export default function SelectDoctor() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { doctor, setDoctor, doctorReady } = useContext(doctorContext);
  const [doctors, setDoctors] = useState<
    { id: string; name: string; designation: string; image: string }[]
  >([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const isDoctor = isDoctorUser(user);

  useEffect(() => {
    if (isLoading) return;
    if (!isDoctor) {
      router.replace("/dashboard");
    }
  }, [isLoading, isDoctor, router]);

  useEffect(() => {
    if (doctorReady && doctor) {
      router.replace("/dashboard");
    }
  }, [doctorReady, doctor, router]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/doctors");
        if (res.ok) {
          const data = await res.json();
          setDoctors(Array.isArray(data) ? data : []);
        }
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

  const handleSelect = (d: { id: string }) => {
    setDoctor(d.id);
    router.replace("/dashboard");
  };

  if (isLoading || !doctorReady || !isDoctor || doctor) {
    return (
      <div className="p-10 flex justify-center min-h-[40vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Select your profile
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Choose which doctor identity you are using for this session.
          </p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctors by name or specialty…"
            className="pl-9"
            aria-label="Search doctors"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : doctors.length === 0 ? (
        <EmptyMessage message="No doctors available." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyMessage message={`No doctors match "${query.trim()}".`} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <DoctorIdentityCard
              key={doc.id}
              doc={doc}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
