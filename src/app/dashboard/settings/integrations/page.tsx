
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon } from "lucide-react";
import Image from "next/image";

export default function IntegrationsPage() {
    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold">Integrations</h1>
                <p className="text-muted-foreground">Connect ServiceRig with other platforms to streamline your workflow.</p>
            </div>
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
