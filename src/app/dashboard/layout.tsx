
'use client'
import React, { Suspense } from 'react';
import Image from 'next/image';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MainNav } from '@/components/dashboard/main-nav';
import { UserNav } from '@/components/dashboard/user-nav';
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
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-center p-2 group-data-[collapsible=icon]:hidden">
             <div className="flex items-start justify-center gap-2">
                <div className="relative">
                    <Logo className="h-10 w-auto" />
                    <Flame className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-orange-500 animate-pulse" />
                </div>
                <Image
                    src="/logo-name.png"
                    alt="ServiceRig Full Logo"
                    width={156}
                    height={39}
                    priority
                    className="w-28 h-auto filter dark:invert"
                />
            </div>
          </div>
           <div className="hidden items-center justify-center p-2 group-data-[collapsible=icon]:flex">
             <div className="relative">
                <Logo className="h-8 w-auto" />
                <Flame className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-3 h-3 text-orange-500 animate-pulse" />
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
