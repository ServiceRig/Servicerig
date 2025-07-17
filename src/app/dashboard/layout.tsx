'use client'
import React, { Suspense } from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MainNav } from '@/components/dashboard/main-nav';
import { UserNav } from '@/components/dashboard/user-nav';
import { Logo } from '@/components/logo';
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'next/navigation';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { role, isLoading } = useRole();

  React.useEffect(() => {
    if (!isLoading && !role) {
      router.push('/');
    }
  }, [isLoading, role, router]);

  if (isLoading || !role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="w-8 h-8 text-primary" />
            <div className="group-data-[collapsible=icon]:hidden">
                <p className="text-lg font-semibold font-headline">ServiceRig</p>
                <p className="text-xs text-muted-foreground">From Dispatch to Dollars</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Suspense fallback={<div>Loading Nav...</div>}>
            <MainNav role={role} />
          </Suspense>
        </SidebarContent>
        <UserNav />
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6">
           <div className="flex items-center justify-between mb-4">
              <SidebarTrigger className="md:hidden"/>
           </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}
