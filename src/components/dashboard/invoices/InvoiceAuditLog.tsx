

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AuditLogEntry } from "@/lib/types";
import { format, formatDistanceToNow } from 'date-fns';
import { User, FileText, Send, CreditCard, ShieldAlert } from "lucide-react";

const actionIcons: { [key: string]: React.ElementType } = {
  'Invoice Created': FileText,
  'Invoice Approved': FileText,
  'Email Sent': Send,
  'Payment Received': CreditCard,
  'Refund Issued': CreditCard,
  'Late Fee Applied': ShieldAlert,
  'Status Changed': FileText,
};

export function InvoiceAuditLog({ logs }: { logs: AuditLogEntry[] }) {
  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>A log of all actions taken on this invoice.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-6 pr-4">
            {logs.map((log) => {
                const Icon = actionIcons[log.action] || User;
                return (
                    <div key={log.id} className="flex gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                           <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                             <p className="text-sm font-medium">
                                {log.action}
                                <span className="text-muted-foreground font-normal"> by {log.userName}</span>
                            </p>
                             <p className="text-xs text-muted-foreground" title={format(new Date(log.timestamp), 'PPpp')}>
                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                            </p>
                            {log.details && <p className="text-xs text-muted-foreground mt-1">{log.details}</p>}
                        </div>
                    </div>
                )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
