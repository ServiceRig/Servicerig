
'use client';

import { useState, useMemo, Fragment } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockData } from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { PurchaseOrder, Vendor, Technician } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { Plus, MoreHorizontal } from 'lucide-react';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getStatusStyles = (status: PurchaseOrder['status']) => {
  switch (status) {
    case 'ordered': return 'bg-blue-500 text-white';
    case 'received': return 'bg-green-500 text-white';
    case 'delivered': return 'bg-purple-500 text-white';
    case 'cancelled': return 'bg-red-500 text-white';
    case 'draft':
    default: return 'bg-gray-500 text-white';
  }
};


export default function PurchaseOrdersPage() {
    const { role } = useRole();
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
        return (mockData.purchaseOrders as PurchaseOrder[]).map(po => {
            const vendor = (mockData.vendors as Vendor[]).find(v => v.id === po.vendorId);
            let destinationName = 'Warehouse';
            if (po.destination !== 'Warehouse') {
                const tech = (mockData.technicians as Technician[]).find(t => t.id === po.destination);
                destinationName = tech ? `Truck - ${tech.name}` : `Unknown (${po.destination})`;
            }
            return {
                ...po,
                vendorName: vendor?.name || 'Unknown Vendor',
                destinationName,
                itemCount: po.parts.length,
                total: po.parts.reduce((sum, part) => sum + (part.qty * part.unitCost), 0),
            };
        });
    });

    const [vendors, setVendors] = useState<Vendor[]>(mockData.vendors as Vendor[]);
    const [technicians, setTechnicians] = useState<Technician[]>(mockData.technicians as Technician[]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [vendorFilter, setVendorFilter] = useState('all');
    const [destinationFilter, setDestinationFilter] = useState('all');

    const filteredPOs = useMemo(() => {
        return purchaseOrders.filter(po => {
            const matchesSearch = searchTerm ? 
                (po.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 po.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;
            const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
            const matchesVendor = vendorFilter === 'all' || po.vendorId === vendorFilter;
            const matchesDestination = destinationFilter === 'all' || po.destination === destinationFilter;
            return matchesSearch && matchesStatus && matchesVendor && matchesDestination;
        });
    }, [purchaseOrders, searchTerm, statusFilter, vendorFilter, destinationFilter]);

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
                            <Link href={getHref("/dashboard/purchase-orders/new")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create PO
                            </Link>
                        </Button>
                    </div>
                </div>
                 <div className="mt-4 flex flex-col md:flex-row gap-2">
                    <Input 
                        placeholder="Search by PO # or vendor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                     <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="ordered">Ordered</SelectItem>
                            <SelectItem value="received">Received</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={vendorFilter} onValueChange={setVendorFilter}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter by vendor" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Vendors</SelectItem>
                            {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter by destination" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Destinations</SelectItem>
                            <SelectItem value="Warehouse">Warehouse</SelectItem>
                            {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}'s Truck</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <DateRangePicker />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>PO #</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Expected</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPOs.length > 0 ? filteredPOs.map((po) => (
                            <TableRow key={po.id}>
                                <TableCell className="font-medium">{po.id.toUpperCase()}</TableCell>
                                <TableCell>{po.vendorName}</TableCell>
                                <TableCell>{po.destinationName}</TableCell>
                                <TableCell>
                                    <Badge className={cn("capitalize", getStatusStyles(po.status))}>
                                        {po.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{po.itemCount}</TableCell>
                                <TableCell>{format(new Date(po.orderDate), 'MMM d, yyyy')}</TableCell>
                                <TableCell>{po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(po.total || 0)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem asChild>
                                                <Link href={getHref(`/dashboard/purchase-orders/${po.id}/edit`)}>View / Edit</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Mark as Received</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
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
