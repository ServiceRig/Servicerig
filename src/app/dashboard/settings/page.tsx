

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, Palette, Users, Link as LinkIcon, Bot, FileText } from "lucide-react";
import Link from "next/link";

const settingsLinks = [
    {
        href: '/dashboard/settings/estimates',
        icon: FilePlus,
        title: 'Estimate Templates',
        description: 'Create and manage reusable estimate templates for common jobs.'
    },
    {
        href: '/dashboard/settings/integrations',
        icon: LinkIcon,
        title: 'Integrations',
        description: 'Connect with third-party services like QuickBooks.'
    },
    {
        href: '/dashboard/settings/automations',
        icon: Bot,
        title: 'Automations',
        description: 'Set up rules to automate your workflow and invoicing.'
    },
    {
        href: '/dashboard/settings/billing',
        icon: FileText,
        title: 'Billing Settings',
        description: 'Configure default payment terms, company info, and late fees.'
    },
    {
        href: '#',
        icon: Users,
        title: 'User Management',
        description: 'Add, remove, and manage user roles and permissions.'
    },
    {
        href: '/dashboard/settings/appearance',
        icon: Palette,
        title: 'Appearance',
        description: 'Customize the look and feel of the application.'
    }
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your organization&apos;s settings.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsLinks.map(link => (
                <Link href={link.href} key={link.title}>
                    <Card className="hover:border-primary transition-colors h-full">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <link.icon className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>{link.title}</CardTitle>
                                <CardDescription>{link.description}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
  );
}
