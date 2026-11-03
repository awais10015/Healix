"use client";

import { useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import doctorContext from "@/app/context/doctorContext";
import Loader from "@/components/Loader";

export function AdminDoctorGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { doctor, doctorReady } = useContext(doctorContext);
  const pathname = usePathname();
  const router = useRouter();

  const isDoctor = isDoctorUser(user);
  const onSelectPage = pathname === "/select-doctor";

  useEffect(() => {
    if (isLoading || !doctorReady) return;
    if (!isDoctor) return;

    if (doctor && onSelectPage) {
      router.replace("/dashboard");
      return;
    }

    if (!doctor && !onSelectPage) {
      router.replace("/select-doctor");
    }
  }, [
    isLoading,
    doctorReady,
    isDoctor,
    doctor,
    onSelectPage,
    router,
  ]);

  if (isLoading || (isDoctor && !doctorReady)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-10">
        <Loader />
      </div>
    );
  }

  if (isDoctor && !doctor && !onSelectPage) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-10">
        <Loader />
      </div>
    );
  }

  return children;
}
