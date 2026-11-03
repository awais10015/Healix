import ChatPage from "./Chat";
import Loader from "@/components/Loader";
import { Suspense } from "react";

export const metadata = {
  title: "Healix-Chat",
  description: "Where care meets innovation",
};

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <ChatPage />
    </Suspense>
  );
}
