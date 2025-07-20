
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { mockData } from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { PurchaseOrder } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { Plus, MoreHorizontal } from 'lucide-react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getStatusStyles = (status: PurchaseOrder['status']) => {
  switch (status) {
    case 'ordered': return 'bg-blue-500 text-white';
    case 'received': return 'bg-green-500 text-white';
    case 'delivered': return 'bg-purple-500 text-white';
    case 'completed': return 'bg-green-600 text-white';
    case 'field-purchased': return 'bg-orange-500 text-white';
    case 'draft':
    default: return 'bg-gray-500 text-white';
  }
};

export default function PurchaseOrdersPage() {
    const { role } = useRole();
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockData.purchaseOrders);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPOs = useMemo(() => {
        return purchaseOrders.filter(po =>
            po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.vendor.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [purchaseOrders, searchTerm]);

    const getHref = (path: string) => {
        let roleParam = role ? `role=${role}` : '';
        return `${path}?${roleParam}`;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>Purchase Orders</CardTitle>
                        <CardDescription>Create and track orders for parts and materials.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href="#">
                                <Plus className="mr-2 h-4 w-4" />
                                Create PO
                            </Link>
                        </Button>
                    </div>
                </div>
                 <div className="mt-4">
                    <Input 
                        placeholder="Search by PO number or vendor..."
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
                            <TableHead>PO #</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPOs.length > 0 ? filteredPOs.map((po) => (
                            <TableRow key={po.id}>
                                <TableCell className="font-medium">{po.id.toUpperCase()}</TableCell>
                                <TableCell>{po.vendor}</TableCell>
                                <TableCell>{format(new Date(po.orderDate), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <Badge className={cn("capitalize", getStatusStyles(po.status))}>
                                        {po.status.replace('-', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(po.total || 0)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Mark as Received</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No purchase orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
