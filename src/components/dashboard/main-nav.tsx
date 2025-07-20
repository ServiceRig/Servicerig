
'use client';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { UserRole } from "@/lib/types";
import { LayoutDashboard, Calendar, UserSquare, Users, BarChart3, Book, Warehouse, Calculator, FileText, FileDiff, FileSignature, ClipboardList, DollarSign, Clock, AppWindow, Settings, LifeBuoy, LogOut, FilePlus, Bot, ListChecks, UserCog, History, HardHat, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';


const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/scheduling", icon: Calendar, label: "Scheduling" },
    { href: "/dashboard/my-schedule", icon: UserSquare, label: "My Schedule" },
    { href: "/dashboard/customers", icon: Users, label: "Customers" },
    { href: "/dashboard/reports", icon: BarChart3, label: "KPIs / Reports",
      subItems: [
        { href: "/dashboard/reports/technician-earnings", icon: UserCog, label: "Tech Earnings" },
        { href: "/dashboard/reports/aging-report", icon: History, label: "Aging Report" },
      ]
    },
    { href: "/dashboard/price-book", icon: Book, label: "Price Book" },
    { href: "/dashboard/inventory", icon: Warehouse, label: "Inventory" },
    { href: "/dashboard/purchase-orders", icon: ShoppingBasket, label: "Purchase Orders" },
    { href: "/dashboard/estimates", icon: Calculator, label: "Estimates" },
    { href: "/dashboard/invoicing", icon: FileText, label: "Invoicing",
      subItems: [
        { href: "/dashboard/invoicing/batch", icon: ListChecks, label: "Batch Billing" },
      ]
    },
    { href: "/dashboard/technician-invoicing", icon: HardHat, label: "Technician Invoicing" },
    { href: "/dashboard/change-orders", icon: FileDiff, label: "Change Orders" },
    { href: "/dashboard/service-agreements", icon: FileSignature, label: "Service Agreements" },
    { href: "/dashboard/forms", icon: ClipboardList, label: "Forms" },
    { href: "/dashboard/financing", icon: DollarSign, label: "Financing" },
    { href: "/dashboard/timeclock", icon: Clock, label: "Timeclock" },
    { href: "/dashboard/ai-tools", icon: AppWindow, label: "AI Tools" },
];

const settingsItems = [
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    { href: "/dashboard/settings/estimates", icon: FilePlus, label: "Estimate Templates" },
    { href: "/dashboard/settings/automations", icon: Bot, label: "Automations" },
    { href: "/dashboard/settings/tax", icon: LandPlot, label: "Tax Settings" },
    { href: "/dashboard/support", icon: LifeBuoy, label: "Support" },
]


export function MainNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    router.push('/');
  }

  const getHref = (baseHref: string) => `${baseHref}?role=${role}`;

  return (
    <>
        <SidebarMenu className="flex-1">
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(item.href) && !item.subItems} tooltip={item.label}>
                        <Link href={getHref(item.href)}>
                            <item.icon/>
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                     {item.subItems && (
                        <SidebarMenuSub>
                            {item.subItems.map(subItem => (
                                <SidebarMenuItem key={subItem.href}>
                                    <SidebarMenuSubButton asChild isActive={pathname.startsWith(subItem.href)}>
                                         <Link href={getHref(subItem.href)}>
                                            <subItem.icon />
                                            <span>{subItem.label}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenuSub>
                     )}
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
             {settingsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                        <Link href={getHref(item.href)}>
                            <item.icon/>
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
             <SidebarSeparator />
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Logout">
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </>
  );
}
