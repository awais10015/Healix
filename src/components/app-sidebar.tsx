"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import SideBarUser from "@/components/SideBarUser";
import { ModeToggle } from "@/components/modeToggle";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  FileText,
  MessageSquare,
  Users,
  Calendar,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import { isDoctorUser } from "@/lib/auth/roles";
import { NotificationBell } from "@/components/NotificationBell";

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isDoctor = isDoctorUser(user);

  const navItems = [
    baseNavItems[0],
    isDoctor
      ? { href: "/doctors", label: "Patients", icon: Users }
      : { href: "/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    ...baseNavItems.slice(1),
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-3">
            <Image
              src="/union2.svg"
              alt=""
              height={40}
              width={36}
              className="h-10 w-9 shrink-0 object-contain"
            />
            <div className="min-w-0 text-left leading-tight">
              <p className="truncate text-base font-semibold text-sidebar-foreground">
                Healix
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Hospital portal
              </p>
            </div>
          </Link>
          <ModeToggle buttonVariant="ghost" className="h-9 w-9" />
          <NotificationBell />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup className="py-4">
          <SidebarGroupLabel className="px-3 text-xs uppercase tracking-wide text-muted-foreground">
            Main menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isNavActive(pathname, href);
                return (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={active}
                      className={cn(
                        active &&
                          "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                      )}
                    >
                      <Link
                        href={href}
                        className="flex items-center gap-3 font-medium"
                      >
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0",
                            active ? "opacity-100" : "opacity-70"
                          )}
                        />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SideBarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
