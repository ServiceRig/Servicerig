
'use client'
import React, { Suspense } from 'react';
import Image from 'next/image';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MainNav } from '@/components/dashboard/main-nav';
import { Logo } from '@/components/logo';
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'next/navigation';
import { Flame } from 'lucide-react';

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
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-end justify-center gap-2">
             <div className="relative">
                <Logo className="h-7 w-auto" />
                <Flame className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-orange-500 animate-pulse" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
                <Image
                    src="/logo-name.png"
                    alt="ServiceRig Full Logo"
                    width={156}
                    height={39}
                    priority
                    className="w-20 h-auto filter brightness-0 invert"
                />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Suspense fallback={<div>Loading Nav...</div>}>
            <MainNav role={role} />
          </Suspense>
        </SidebarContent>
        <SidebarFooter>
            <div className="text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
                Version v0.1.0
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6">
           <div className="flex items-center justify-between mb-4">
              <SidebarTrigger />
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
