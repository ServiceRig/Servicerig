
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CommunicationLog } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, formatDistanceToNow } from 'date-fns';
import { Mail, Phone, MessageSquare, ArrowRight, ArrowLeft } from "lucide-react";

const actionIcons: { [key: string]: React.ElementType } = {
  Email: Mail,
  Call: Phone,
  SMS: MessageSquare
};

export function CustomerCommunication({ logs }: { logs: CommunicationLog[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Log</CardTitle>
        <CardDescription>A record of all interactions with this customer.</CardDescription>
      </CardHeader>
      <CardContent>
         {logs.length > 0 ? (
          <ScrollArea className="h-96">
            <div className="space-y-6 pr-4">
              {logs.map((log) => {
                  const Icon = actionIcons[log.type] || Mail;
                  const isOutbound = log.direction === 'outbound';
                  return (
                      <div key={log.id} className="flex gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-grow">
                              <p className="text-sm font-medium flex items-center gap-1">
                                  {isOutbound ? <ArrowRight className="h-3 w-3 text-blue-500"/> : <ArrowLeft className="h-3 w-3 text-green-500"/>}
                                  {log.type} {isOutbound ? 'to' : 'from'} Customer
                                  <span className="text-muted-foreground font-normal ml-2">by {log.staffMemberId}</span>
                              </p>
                               <p className="text-xs text-muted-foreground" title={format(new Date(log.timestamp), 'PPpp')}>
                                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                              </p>
                              {log.content && <p className="text-sm text-muted-foreground mt-1 bg-muted/50 p-2 rounded-md">{log.content}</p>}
                          </div>
                      </div>
                  )
              })}
            </div>
          </ScrollArea>
         ) : (
           <p className="text-muted-foreground text-center py-8">No communication logged for this customer.</p>
         )}
      </CardContent>
    </Card>
  );
}
