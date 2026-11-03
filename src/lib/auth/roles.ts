import type { SafeUser, SessionPayload } from "./constants";

export function isDoctorUser(
  user: Pick<SafeUser, "role"> | null | undefined
): boolean {
  return user?.role === "doctor" || user?.role === "admin";
}

export function isPatientUser(
  user: Pick<SafeUser, "role"> | null | undefined
): boolean {
  return !isDoctorUser(user);
}

export function isDoctorSession(
  session: Pick<SessionPayload, "role"> | null | undefined
): boolean {
  return session?.role === "doctor" || session?.role === "admin";
}

export function isClinicalStaff(
  user: Pick<SafeUser, "role"> | null | undefined
): boolean {
  return (
    user?.role === "doctor" ||
    user?.role === "nurse" ||
    user?.role === "admin"
  );
}
