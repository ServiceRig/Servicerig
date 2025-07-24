

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon, Calendar, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { useRole } from "@/hooks/use-role";

export default function IntegrationsPage() {
    // In a real app, this would come from the logged-in user's context
    const userId = 'admin1'; 
    const googleAuthUrl = `/googleCalendarAuthRedirect?userId=${userId}`;
    const { role } = useRole();

    const getHref = (path: string) => {
        let roleParam = role ? `role=${role}` : '';
        return `${path}?${roleParam}`;
    }


    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold">Integrations</h1>
                <p className="text-muted-foreground">Connect ServiceRig with other platforms to streamline your workflow.</p>
            </div>
            <Card>
                <CardHeader>
                     <div className="flex items-center gap-4">
                        <Calendar className="h-8 w-8 text-blue-500" />
                        <div>
                             <CardTitle>Google Calendar</CardTitle>
                             <CardDescription>Enable two-way sync for your job schedule.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-6 border-t">
                    <p className="text-sm text-muted-foreground">Status: <span className="font-semibold text-destructive">Not Connected</span></p>
                    <Button asChild>
                        <a href={googleAuthUrl} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Connect to Google Calendar
                        </a>
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <CreditCard className="h-8 w-8 text-indigo-500" />
                        <div>
                             <CardTitle>Stripe</CardTitle>
                             <CardDescription>Connect to Stripe to process credit card and ACH payments.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-6 border-t">
                    <p className="text-sm text-muted-foreground">Status: <span className="font-semibold text-destructive">Not Connected</span></p>
                    <Button asChild>
                        <Link href={getHref('/dashboard/settings/stripe')}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Manage Connection
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Image src="/quickbooks-logo.png" alt="QuickBooks Logo" width={140} height={35} className="h-8 w-auto"/>
                        <div>
                             <CardTitle>QuickBooks Online</CardTitle>
                             <CardDescription>Sync your customers, invoices, and payments automatically.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-6 border-t">
                    <p className="text-sm text-muted-foreground">Status: <span className="font-semibold text-destructive">Not Connected</span></p>
                    <Button>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Connect to QuickBooks
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Image src="/xero-logo.svg" alt="Xero Logo" width={80} height={25} className="h-7 w-auto"/>
                        <div>
                             <CardTitle>Xero</CardTitle>
                             <CardDescription>Sync your contacts, invoices, and payments with Xero.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-6 border-t">
                    <p className="text-sm text-muted-foreground">Status: <span className="font-semibold text-destructive">Not Connected</span></p>
                    <Button>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Connect to Xero
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
