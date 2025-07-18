
'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockEstimates } from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn, getEstimateStatusStyles } from '@/lib/utils';
import type { Estimate } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { UserRole } from '@/lib/types';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function EstimatesPage() {
    const { role } = useRole();
    const [estimates, setEstimates] = useState<Estimate[]>([]);

    useEffect(() => {
        // This is a workaround for mock data to "re-fetch" when navigated to.
        // In a real app with Firestore, this would be a real-time listener or a fetch call.
        setEstimates([...mockEstimates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, []);


    const getHref = (path: string) => {
        return `${path}?role=${role || UserRole.Admin}`
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Estimates</CardTitle>
          <CardDescription>Manage your estimates.</CardDescription>
        </div>
        <Button asChild>
            <Link href={getHref("/dashboard/estimates/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Estimate
            </Link>
        </Button>
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
              {estimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-medium">{estimate.estimateNumber}</TableCell>
                   <TableCell>{estimate.title}</TableCell>
                   <TableCell>{format(new Date(estimate.createdAt), 'MMM d, yyyy')}</TableCell>
                   <TableCell>{formatCurrency(estimate.total)}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getEstimateStatusStyles(estimate.status))}>
                      {estimate.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                       <Link href={getHref(`/dashboard/estimates/${estimate.id}`)}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {estimates.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">No estimates found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  )
}
