export const ACTING_DOCTOR_STORAGE_KEY = "healix_acting_doctor_id";
export const ACTING_DOCTOR_COOKIE_NAME = "healix_acting_doctor_id";

export function clearActingDoctorStorage() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ACTING_DOCTOR_STORAGE_KEY);
  }
}

export function readActingDoctorStorage(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACTING_DOCTOR_STORAGE_KEY);
}
