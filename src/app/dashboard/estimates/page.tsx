
'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockData } from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn, getEstimateStatusStyles } from '@/lib/utils';
import type { Estimate } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { UserRole } from '@/lib/types';
import { Plus } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function EstimatesPageContent() {
    const { role } = useRole();
    const searchParams = useSearchParams();
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const sortedEstimates = [...mockData.estimates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setEstimates(sortedEstimates);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const newEstimateData = searchParams.get('newEstimateData');
        if (newEstimateData) {
            try {
                const newEstimate = JSON.parse(decodeURIComponent(newEstimateData));
                // Ensure date strings are converted to Date objects
                newEstimate.createdAt = new Date(newEstimate.createdAt);
                newEstimate.updatedAt = new Date(newEstimate.updatedAt);

                if (!estimates.some(e => e.id === newEstimate.id)) {
                    setEstimates(prevEstimates => [newEstimate, ...prevEstimates]);
                }
            } catch (error) {
                console.error("Failed to parse new estimate data from URL", error);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);


    const getHref = (path: string) => {
        let roleParam = role ? `role=${role}` : '';
        if (path.includes('?')) {
            return `${path}&${roleParam}`;
        }
        return `${path}?${roleParam}`;
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
              {isLoading ? (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">Loading estimates...</TableCell>
                  </TableRow>
              ) : estimates.map((estimate) => (
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
               {!isLoading && estimates.length === 0 && (
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

export default function EstimatesPage() {
    return (
        <Suspense fallback={<div>Loading estimates...</div>}>
            <EstimatesPageContent />
        </Suspense>
    )
}
