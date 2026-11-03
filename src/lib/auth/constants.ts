export const SESSION_COOKIE_NAME = "healix_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/doctors",
  "/reports",
  "/chat",
  "/meeting",
  "/select-doctor",
  "/settings",
  "/appointments",
  "/patients",
];

export const PUBLIC_PATH_PREFIXES = [
  "/",
  "/about",
  "/reviews",
  "/sign-in",
  "/sign-up",
];

export const ADMIN_EMAIL = "doctor@gmail.com";

export type SessionPayload = {
  sub: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
};

export type SafeUser = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  role: string;
};
