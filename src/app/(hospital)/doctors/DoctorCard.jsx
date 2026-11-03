"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";

const chatBtnClass =
  "w-full bg-primary hover:bg-primary/90 text-primary-foreground";

export function DoctorBrowseCard({ doc, onChat }) {
  return (
    <article className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="relative aspect-[4/5] w-full bg-muted">
        <Image
          src={doc.image}
          alt={doc.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h2 className="font-semibold text-foreground leading-tight">
            {doc.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{doc.designation}</p>
        </div>
        <Button
          type="button"
          className={chatBtnClass}
          onClick={() => onChat(doc.id, doc)}
        >
          Chat
        </Button>
      </div>
    </article>
  );
}

export function DoctorIdentityCard({ doc, onSelect }) {
  return (
    <article className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="relative aspect-[4/5] w-full bg-muted">
        <Image
          src={doc.image}
          alt={doc.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h2 className="font-semibold text-foreground leading-tight">
            {doc.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{doc.designation}</p>
        </div>
        <Button type="button" className={chatBtnClass} onClick={() => onSelect(doc)}>
          It&apos;s me
        </Button>
      </div>
    </article>
  );
}

export function PatientChatCard({ patient, onChat, showProfileLink }) {
  const displayName =
    patient.firstName || patient.username || patient.email || "Patient";
  const pid = patient.id || patient._id;

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-3">
      <UserAvatar
        src={patient.photo}
        alt={displayName}
        size={96}
        className="h-24 w-24 ring-2 ring-primary/30"
        fallbackClassName="bg-muted text-primary h-24 w-24 ring-2 ring-primary/30 text-lg"
        fallbackText={(displayName[0] || "?").toUpperCase()}
      />
      <div className="min-w-0 w-full">
        <h2 className="font-semibold truncate">{displayName}</h2>
        {patient.email && (
          <p className="text-xs text-muted-foreground truncate">{patient.email}</p>
        )}
      </div>
      <div className="flex flex-col w-full gap-2">
        {showProfileLink && pid && (
          <Button asChild type="button" variant="outline" className="w-full">
            <Link href={`/patients/${pid}`}>View profile</Link>
          </Button>
        )}
        <Button
          type="button"
          className={chatBtnClass}
          onClick={() => onChat(pid, patient)}
        >
          Chat
        </Button>
      </div>
    </article>
  );
}
