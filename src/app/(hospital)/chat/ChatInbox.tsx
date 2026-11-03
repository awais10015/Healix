"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type InboxThread = {
  _id: string;
  peerLabel?: string;
  lastPreview?: string;
};

export function ChatInbox({
  threads,
  onOpenThread,
  onNewChat,
}: {
  threads: InboxThread[];
  onOpenThread: (thread: InboxThread) => void;
  onNewChat: () => void;
}) {
  if (!threads.length) {
    return (
      <div className="space-y-4">
        <EmptyInbox message="No conversations yet." />
        <Button type="button" onClick={onNewChat} className="w-full sm:w-auto">
          Start a new conversation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onNewChat}>
          New conversation
        </Button>
      </div>
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {threads.map((t) => (
          <li key={t._id}>
            <button
              type="button"
              onClick={() => onOpenThread(t)}
              className="w-full text-left px-4 py-4 hover:bg-muted/50 transition"
            >
              <p className="font-medium">{t.peerLabel || "Conversation"}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {t.lastPreview || "No messages yet"}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyInbox({ message }: { message: string }) {
  return (
    <p className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-xl">
      {message}
    </p>
  );
}

export function PatientProfileLink({
  patientId,
  children,
}: {
  patientId: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={`/patients/${patientId}`}
      className="text-sm text-primary hover:underline"
    >
      {children}
    </Link>
  );
}
