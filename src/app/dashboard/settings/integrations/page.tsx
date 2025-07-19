
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon } from "lucide-react";

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
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/QuickBooks_logo.svg/2560px-QuickBooks_logo.svg.png" alt="QuickBooks Logo" className="h-8 w-auto"/>
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
        </div>
    )
}
