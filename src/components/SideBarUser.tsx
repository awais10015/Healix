"use client";

import React from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";

const SideBarUser = () => {
  const { user, logout } = useAuth();
  const displayName = user?.firstName || user?.username || "User";
  const roleLabel =
    user?.role === "doctor"
      ? "Doctor"
      : user?.role === "patient"
        ? "Patient"
        : user?.role || "";
  const initial = (user?.firstName?.[0] || user?.email?.[0] || "?").toUpperCase();

  return (
    <div className="flex items-center gap-3 w-full rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
      <UserAvatar
        src={user?.photo}
        alt={displayName}
        size={40}
        className="h-10 w-10 ring-2 ring-primary/30"
        fallbackClassName="bg-primary/20 text-primary ring-2 ring-primary/30"
        fallbackText={initial}
      />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold truncate text-sidebar-foreground">
          {displayName}
        </p>
        {roleLabel && (
          <p className="text-xs text-muted-foreground truncate max-w-[7.5rem] capitalize">
            {roleLabel}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-primary"
        asChild
        title="Settings"
      >
        <Link href="/settings">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-primary"
        onClick={() => logout()}
        title="Log out"
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Log out</span>
      </Button>
    </div>
  );
};

export default SideBarUser;
