
'use client'
import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MainNav } from '@/components/dashboard/main-nav';
import { Logo } from '@/components/logo';
import { useRole } from '@/hooks/use-role';
import { usePathname, useRouter } from 'next/navigation';
import { Flame, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ScheduleViewProvider, useScheduleView } from './scheduling/page';


function FitToScreenButton() {
    const { isFitToScreen, setIsFitToScreen } = useScheduleView();
    return (
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setIsFitToScreen(!isFitToScreen)} className={cn("h-7 w-7", isFitToScreen && "bg-accent text-accent-foreground")}>
                        <Maximize className="h-4 w-4" />
                        <span className="sr-only">Fit to Screen</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Fit to Screen</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, isLoading } = useRole();

  React.useEffect(() => {
    if (!isLoading && !role) {
      router.push('/');
    }
  }, [isLoading, role, router]);

  const isSchedulingPage = pathname.includes('/dashboard/scheduling');

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
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                {isSchedulingPage && (
                   <FitToScreenButton />
                )}
              </div>
           </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSchedulingPage = pathname.includes('/dashboard/scheduling');

  const content = (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )

  if (isSchedulingPage) {
    return <ScheduleViewProvider>{content}</ScheduleViewProvider>
  }
  
  return content;
}
