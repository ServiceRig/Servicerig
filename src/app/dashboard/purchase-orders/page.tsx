
'use client';

import { useState, useMemo, Fragment } from 'react';
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
import { Plus, MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';

type SortableColumn = 'vendor' | 'orderDate' | 'status' | 'total';
type SortDirection = 'asc' | 'desc';

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

const SortableHeader = ({
  column,
  children,
  sortColumn,
  sortDirection,
  onSort,
}: {
  column: SortableColumn;
  children: React.ReactNode;
  sortColumn: SortableColumn;
  sortDirection: SortDirection;
  onSort: (column: SortableColumn) => void;
}) => {
  const isSorted = sortColumn === column;
  return (
    <TableHead onClick={() => onSort(column)} className="cursor-pointer hover:bg-muted/50">
      <div className="flex items-center gap-2">
        {children}
        {isSorted && (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
      </div>
    </TableHead>
  );
};


export default function PurchaseOrdersPage() {
    const { role } = useRole();
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockData.purchaseOrders);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<SortableColumn>('orderDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (column: SortableColumn) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const filteredPOs = useMemo(() => {
        let sortableItems = [...purchaseOrders];

        if (searchTerm) {
             sortableItems = sortableItems.filter(po =>
                po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                po.vendor.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        sortableItems.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortColumn === 'total') {
                aValue = a.total || 0;
                bValue = b.total || 0;
            } else if (sortColumn === 'orderDate') {
                aValue = new Date(a.orderDate);
                bValue = new Date(b.orderDate);
            } else {
                aValue = a[sortColumn];
                bValue = b[sortColumn];
            }

            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        return sortableItems;

    }, [purchaseOrders, searchTerm, sortColumn, sortDirection]);

    const handleRowClick = (poId: string) => {
        setExpandedRowId(prevId => prevId === poId ? null : poId);
    };

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
                             <SortableHeader column="vendor" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
                                Vendor
                            </SortableHeader>
                            <SortableHeader column="orderDate" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
                                Order Date
                            </SortableHeader>
                            <SortableHeader column="status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
                                Status
                            </SortableHeader>
                            <SortableHeader column="total" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>
                                <div className="text-right w-full">Total</div>
                            </SortableHeader>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPOs.length > 0 ? filteredPOs.map((po) => (
                            <Fragment key={po.id}>
                                <TableRow onClick={() => handleRowClick(po.id)} className="cursor-pointer">
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
                                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild>
                                                    <Link href={getHref(`/dashboard/purchase-orders/${po.id}`)}>View Full Details</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Mark as Received</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                {expandedRowId === po.id && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="p-0">
                                            <div className="p-4 bg-muted">
                                                <h4 className="font-bold mb-2">Order Details</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Part Name</TableHead>
                                                            <TableHead>Quantity</TableHead>
                                                            <TableHead className="text-right">Unit Cost</TableHead>
                                                            <TableHead className="text-right">Line Total</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {po.parts.map(part => {
                                                            const partDetails = mockData.inventoryItems.find(item => item.id === part.partId);
                                                            return (
                                                                <TableRow key={part.partId}>
                                                                    <TableCell>{partDetails?.name || 'Unknown Part'}</TableCell>
                                                                    <TableCell>{part.qty}</TableCell>
                                                                    <TableCell className="text-right">{formatCurrency(part.unitCost)}</TableCell>
                                                                    <TableCell className="text-right">{formatCurrency(part.qty * part.unitCost)}</TableCell>
                                                                </TableRow>
                                                            )
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
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
