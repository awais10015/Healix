import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminDoctorGate } from "@/components/AdminDoctorGate";

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-auto">
        <AdminDoctorGate>{children}</AdminDoctorGate>
      </SidebarInset>
    </SidebarProvider>
  );
}
