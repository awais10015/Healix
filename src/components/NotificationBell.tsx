"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationRow = {
  _id: string;
  title: string;
  body?: string;
  link?: string;
  read?: boolean;
};

export function NotificationBell() {
  const [items, setItems] = useState<NotificationRow[]>([]);

  const load = async () => {
    const res = await fetch("/api/notifications", { credentials: "include" });
    if (res.ok) {
      setItems(await res.json());
    }
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 60000);
    return () => window.clearInterval(id);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    await load();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 shrink-0"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            No notifications
          </p>
        ) : (
          items.slice(0, 12).map((n) => (
            <DropdownMenuItem key={n._id} asChild className="cursor-pointer">
              <Link
                href={n.link || "/dashboard"}
                onClick={() => markRead(n._id)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <span className="font-medium text-sm">{n.title}</span>
                {n.body && (
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {n.body}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
