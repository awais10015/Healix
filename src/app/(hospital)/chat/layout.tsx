import { Suspense } from "react";
import Loader from "@/components/Loader";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={<Loader />}>{children}</Suspense>
    </div>
  );
}
