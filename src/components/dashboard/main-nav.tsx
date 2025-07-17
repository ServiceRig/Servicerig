
'use client';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { UserRole } from "@/lib/types";
import { LayoutDashboard, Calendar, Users, Clock, FileText, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';


const navItems = {
  admin: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/scheduling", icon: Calendar, label: "Scheduling" },
    { href: "/dashboard/customers", icon: Users, label: "Customers" },
    { href: "/dashboard/invoicing", icon: FileText, label: "Invoicing" },
    { href: "/dashboard/ai-tools", icon: Bot, label: "AI Estimator" },
  ],
  dispatcher: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/scheduling", icon: Calendar, label: "Scheduling" },
    { href: "/dashboard/customers", icon: Users, label: "Customers" },
     { href: "/dashboard/ai-tools", icon: Bot, label: "AI Estimator" },
  ],
  technician: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/my-schedule", icon: Calendar, label: "My Schedule" },
    { href: "/dashboard/timeclock", icon: Clock, label: "Timeclock" },
  ],
};


export function MainNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = navItems[role] || [];

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
            <Link href={item.href}>
                <item.icon/>
                <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
