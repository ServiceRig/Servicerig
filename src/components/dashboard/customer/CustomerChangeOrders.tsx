
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChangeOrder } from "@/lib/types";

export function CustomerChangeOrders({ changeOrders }: { changeOrders: ChangeOrder[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Orders</CardTitle>
        <CardDescription>All change orders for this customer.</CardDescription>
      </CardHeader>
      <CardContent>
         <p className="text-muted-foreground text-center py-8">Change orders coming soon.</p>
      </CardContent>
    </Card>
  );
}
