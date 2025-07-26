
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChangeOrder, UserRole } from "@/lib/types";
import { format } from "date-fns";
import Link from "next/link";
import { cn, getChangeOrderStatusStyles } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function CustomerChangeOrders({ changeOrders }: { changeOrders: ChangeOrder[] }) {
  const { role } = useRole();
  const getHref = (orderId: string) => `/dashboard/change-orders/${orderId}?role=${role || UserRole.Admin}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Orders</CardTitle>
        <CardDescription>All change orders for this customer.</CardDescription>
      </CardHeader>
      <CardContent>
         {changeOrders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changeOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{format(new Date(order.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{order.title}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getChangeOrderStatusStyles(order.status))}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={getHref(order.id)}>View Order</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
           <p className="text-muted-foreground text-center py-8">No change orders found for this customer.</p>
        )}
      </CardContent>
    </Card>
  );
}
