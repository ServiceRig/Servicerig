
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { mockData } from '@/lib/mock-data';
import { format } from 'date-fns';
import type { ChangeOrder } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getStatusStyles = (status: ChangeOrder['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'invoiced':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    case 'rejected':
      return 'bg-red-500 hover:bg-red-600 text-white';
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

export default function ChangeOrdersPage() {
    const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>(() => {
        return mockData.changeOrders.map(co => ({
            ...co,
            customerName: mockData.customers.find(c => c.id === co.customerId)?.primaryContact.name || 'Unknown',
            jobTitle: mockData.jobs.find(j => j.id === co.jobId)?.title || 'Unknown Job',
        }));
    });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredChangeOrders = useMemo(() => {
        return changeOrders.filter(co =>
            co.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            co.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            co.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [changeOrders, searchTerm]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Orders</CardTitle>
                <CardDescription>
                    Manage and track approved changes to ongoing jobs.
                </CardDescription>
                 <div className="mt-4">
                    <Input 
                        placeholder="Search by title, customer, or job..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Job</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredChangeOrders.length > 0 ? filteredChangeOrders.map(co => (
                            <TableRow key={co.id}>
                                <TableCell className="font-medium">{co.title}</TableCell>
                                <TableCell>
                                    <Link href={`/dashboard/jobs/${co.jobId}`} className="hover:underline text-primary">
                                        {co.jobTitle}
                                    </Link>
                                </TableCell>
                                <TableCell>{co.customerName}</TableCell>
                                <TableCell>{format(new Date(co.createdAt), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <Badge className={cn('capitalize', getStatusStyles(co.status))}>
                                        {co.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(co.total)}</TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem disabled={co.status === 'invoiced'}>
                                                Generate Invoice
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No change orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter className="text-sm text-muted-foreground">
                Showing {filteredChangeOrders.length} of {changeOrders.length} change orders.
            </CardFooter>
        </Card>
    );
}
