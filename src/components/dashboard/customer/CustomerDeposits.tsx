
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Deposit } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function CustomerDeposits({ deposits }: { deposits: Deposit[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposits on File</CardTitle>
        <CardDescription>Available credits or retainers.</CardDescription>
      </CardHeader>
      <CardContent>
        {deposits.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell>{format(new Date(deposit.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(deposit.amount)}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", deposit.status === 'available' ? 'bg-green-500' : 'bg-yellow-500')}>
                        {deposit.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No deposits on file.</p>
        )}
         <Button className="w-full mt-4" variant="outline">Request a Deposit</Button>
      </CardContent>
    </Card>
  );
}
