
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
import { MoreHorizontal, PlusCircle, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { useRole } from '@/hooks/use-role';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getStatusStyles = (status: ChangeOrder['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'invoiced':
    case 'completed':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    case 'rejected':
      return 'bg-red-500 hover:bg-red-600 text-white';
    case 'pending_approval':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

type SortableKeys = keyof (ChangeOrder & { customerName?: string; jobTitle?: string });

type SortConfig = {
    key: SortableKeys;
    direction: 'ascending' | 'descending';
} | null;


export default function ChangeOrdersPage() {
    const { role } = useRole();
    const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>(() => {
        return mockData.changeOrders.map(co => ({
            ...co,
            customerName: mockData.customers.find(c => c.id === co.customerId)?.primaryContact.name || 'Unknown',
            jobTitle: mockData.jobs.find(j => j.id === co.jobId)?.title || 'Unknown Job',
        }));
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredChangeOrders = useMemo(() => {
        let sortableItems = [...changeOrders];
        
        // Filtering
        if (searchTerm) {
            sortableItems = sortableItems.filter(co =>
                co.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                co.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                co.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sorting
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof ChangeOrder];
                const bValue = b[sortConfig.key as keyof ChangeOrder];

                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return sortableItems;
    }, [changeOrders, searchTerm, sortConfig]);
    
    const getHref = (path: string) => `/dashboard${path}?role=${role || 'admin'}`;
    
    const getSortIndicator = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }

    return (
        <Card>
            <CardHeader>
                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>Change Orders</CardTitle>
                        <CardDescription>
                            Manage and track approved changes to ongoing jobs.
                        </CardDescription>
                    </div>
                     <Button asChild>
                        <Link href={getHref('/change-orders/new')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Change Order
                        </Link>
                    </Button>
                </div>
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
                             <TableHead>
                                <Button variant="ghost" onClick={() => requestSort('title')}>
                                    Title {getSortIndicator('title')}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => requestSort('jobTitle')}>
                                    Job {getSortIndicator('jobTitle')}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => requestSort('customerName')}>
                                    Customer {getSortIndicator('customerName')}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => requestSort('createdAt')}>
                                    Date {getSortIndicator('createdAt')}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => requestSort('status')}>
                                    Status {getSortIndicator('status')}
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">
                                <Button variant="ghost" onClick={() => requestSort('total')}>
                                    Amount {getSortIndicator('total')}
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedAndFilteredChangeOrders.length > 0 ? sortedAndFilteredChangeOrders.map(co => (
                            <TableRow key={co.id}>
                                <TableCell className="font-medium">{co.title}</TableCell>
                                <TableCell>
                                    <Link href={getHref(`/jobs/${co.jobId}`)} className="hover:underline text-primary">
                                        {co.jobTitle}
                                    </Link>
                                </TableCell>
                                <TableCell>{co.customerName}</TableCell>
                                <TableCell>{format(new Date(co.createdAt), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <Badge className={cn('capitalize', getStatusStyles(co.status))}>
                                        {co.status.replace(/_/g, ' ')}
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
                                             <DropdownMenuItem>Edit</DropdownMenuItem>
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
                Showing {sortedAndFilteredChangeOrders.length} of {changeOrders.length} change orders.
            </CardFooter>
        </Card>
    );
}