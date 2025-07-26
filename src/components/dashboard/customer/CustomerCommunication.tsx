
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CommunicationLog } from "@/lib/types";

export function CustomerCommunication({ logs }: { logs: CommunicationLog[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Log</CardTitle>
        <CardDescription>A record of all interactions with this customer.</CardDescription>
      </CardHeader>
      <CardContent>
         <p className="text-muted-foreground text-center py-8">Communication log coming soon.</p>
      </CardContent>
    </Card>
  );
}
