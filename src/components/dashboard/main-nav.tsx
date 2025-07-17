
'use client';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { UserRole } from "@/lib/types";
import { LayoutDashboard, Calendar, UserSquare, Users, BarChart3, Book, Warehouse, Calculator, FileText, FileDiff, FileSignature, ClipboardList, DollarSign, Clock, AppWindow, Settings, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';


const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/scheduling", icon: Calendar, label: "Scheduling" },
    { href: "/dashboard/technician-view", icon: UserSquare, label: "Technician View" },
    { href: "/dashboard/customers", icon: Users, label: "Customers" },
    { href: "/dashboard/reports", icon: BarChart3, label: "Reports" },
    { href: "/dashboard/price-book", icon: Book, label: "Price Book" },
    { href: "/dashboard/inventory", icon: Warehouse, label: "Inventory" },
    { href: "/dashboard/estimates", icon: Calculator, label: "Estimates" },
    { href: "/dashboard/invoices", icon: FileText, label: "Invoices" },
    { href: "/dashboard/change-orders", icon: FileDiff, label: "Change Orders" },
    { href: "/dashboard/service-agreements", icon: FileSignature, label: "Service Agreements" },
    { href: "/dashboard/forms", icon: ClipboardList, label: "Forms" },
    { href: "/dashboard/financing", icon: DollarSign, label: "Financing" },
    { href: "/dashboard/time-clock", icon: Clock, label: "Time Clock" },
    { href: "/dashboard/feature-matrix", icon: AppWindow, label: "Feature Matrix" },
];

const settingsItems = [
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    { href: "/dashboard/support", icon: LifeBuoy, label: "Support" },
]


export function MainNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  // For now, all roles see the same nav items based on the screenshot.
  // This can be customized later by filtering `navItems` based on `role`.

  return (
    <>
        <SidebarMenu className="flex-1">
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                        <item.icon/>
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
             {settingsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                        <item.icon/>
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    </>
  );
}
