"use client";
import { useRef } from "react";
import MainSidebar, { MainSidebarRef } from "@/components/layout/main-sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarRef = useRef<MainSidebarRef>(null);

  const handleMenuClick = () => {
    sidebarRef.current?.toggleMobileSidebar();
  };

  return (
    <SidebarProvider onMenuClick={handleMenuClick}>
      <div className="relative flex h-dvh overflow-hidden lg:h-screen">
        <MainSidebar ref={sidebarRef} />

        <main className="w-full flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
