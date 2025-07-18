
'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockEstimates } from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Estimate } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { UserRole } from '@/lib/types';


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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function EstimatesPage() {
    const { role } = useRole();

    const getHref = (estimateId: string) => {
        return `/dashboard/estimates/${estimateId}?role=${role || UserRole.Admin}`
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimates</CardTitle>
        <CardDescription>Manage your estimates.</CardDescription>
      </CardHeader>
      <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEstimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-medium">{estimate.estimateNumber}</TableCell>
                   <TableCell>{estimate.title}</TableCell>
                   <TableCell>{format(new Date(estimate.createdAt), 'MMM d, yyyy')}</TableCell>
                   <TableCell>{formatCurrency(estimate.total)}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getStatusStyles(estimate.status))}>
                      {estimate.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                       <Link href={getHref(estimate.id)}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  )
}
