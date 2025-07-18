
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Estimate, UserRole } from "@/lib/types";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const getStatusStyles = (status: Estimate['status']) => {
  switch (status) {
    case 'sent':
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    case 'accepted':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'rejected':
      return 'bg-red-500 hover:bg-red-600 text-white';
    case 'draft':
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

export function CustomerEstimates({ estimates }: { estimates: Estimate[] }) {
  const { role } = useRole();

  const getHref = (estimateId: string) => {
    return `/dashboard/estimates/${estimateId}?role=${role || UserRole.Admin}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimates</CardTitle>
        <CardDescription>All estimates associated with this customer.</CardDescription>
      </CardHeader>
      <CardContent>
        {estimates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell>{estimate.estimateNumber}</TableCell>
                  <TableCell className="font-medium">{estimate.title}</TableCell>
                  <TableCell>{format(new Date(estimate.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getStatusStyles(estimate.status))}>
                      {estimate.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(estimate.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={getHref(estimate.id)}>View Estimate</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No estimates found.</p>
        )}
      </CardContent>
    </Card>
  );
}
