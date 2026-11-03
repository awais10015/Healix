import { Suspense } from "react";
import SignInForm from "./SignInForm";

export const metadata = {
  title: "Healix — Sign in",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Loading…</div>}>
      <SignInForm />
    </Suspense>
  );
}
