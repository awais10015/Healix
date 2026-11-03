"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import doctorContext from "@/app/context/doctorContext";
import {
  ACTING_DOCTOR_STORAGE_KEY,
  readActingDoctorStorage,
} from "@/lib/acting-doctor-storage";

const DoctorContextProvider = ({ children }) => {
  const { user } = useAuth();
  const [doctor, setDoctorState] = useState(null);
  const [doctorReady, setDoctorReady] = useState(false);

  const isDoctor = isDoctorUser(user);

  useEffect(() => {
    const stored = readActingDoctorStorage();
    if (stored) setDoctorState(stored);
    setDoctorReady(true);
  }, []);

  const setDoctor = useCallback(
    (id) => {
      const value = id ? String(id) : null;
      setDoctorState(value);
      if (typeof window === "undefined") return;
      if (isDoctor) {
        if (value) {
          sessionStorage.setItem(ACTING_DOCTOR_STORAGE_KEY, value);
          fetch("/api/auth/acting-doctor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ doctorProfileId: value }),
            credentials: "include",
          }).catch(() => {});
        } else {
          sessionStorage.removeItem(ACTING_DOCTOR_STORAGE_KEY);
          fetch("/api/auth/acting-doctor", {
            method: "DELETE",
            credentials: "include",
          }).catch(() => {});
        }
      }
    },
    [isDoctor]
  );

  const clearDoctor = useCallback(() => {
    setDoctor(null);
  }, [setDoctor]);

  const value = useMemo(
    () => ({ doctor, setDoctor, clearDoctor, doctorReady }),
    [doctor, setDoctor, clearDoctor, doctorReady]
  );

  return (
    <doctorContext.Provider value={value}>{children}</doctorContext.Provider>
  );
};

export default DoctorContextProvider;
