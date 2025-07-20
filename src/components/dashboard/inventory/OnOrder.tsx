
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockData } from '@/lib/mock-data';
import type { PurchaseOrder, Technician } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CheckCheck } from 'lucide-react';

const getStatusStyles = (status: PurchaseOrder['status']) => {
  switch (status) {
    case 'ordered': return 'bg-blue-500 text-white';
    case 'approved': return 'bg-green-400 text-white';
    case 'pending': return 'bg-yellow-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

type EnrichedPurchaseOrder = PurchaseOrder & {
    destinationName: string;
}

export function OnOrder({ searchTerm }: { searchTerm: string }) {
    const { toast } = useToast();
    const [onOrderPOs, setOnOrderPOs] = useState<EnrichedPurchaseOrder[]>(() => {
        return mockData.purchaseOrders
            .filter(po => ['ordered', 'approved', 'pending'].includes(po.status))
            .map(po => {
                let destinationName = 'Warehouse';
                if (po.destination !== 'Warehouse') {
                    const tech = (mockData.technicians as Technician[]).find(t => t.id === po.destination);
                    destinationName = tech ? `Truck - ${tech.name}` : `Unknown (${po.destination})`;
                }
                return { ...po, destinationName };
            });
    });

    const filteredPOs = useMemo(() => {
        if (!searchTerm) return onOrderPOs;
        const lowercasedTerm = searchTerm.toLowerCase();
        return onOrderPOs.filter(po =>
            po.id.toLowerCase().includes(lowercasedTerm) ||
            po.vendor.toLowerCase().includes(lowercasedTerm) ||
            po.destinationName.toLowerCase().includes(lowercasedTerm)
        );
    }, [onOrderPOs, searchTerm]);

    const handleMarkAsReceived = (poId: string) => {
        const po = onOrderPOs.find(p => p.id === poId);
        if (!po) return;

        // In a real app, this would be a server action to update the PO status
        // and trigger inventory level updates.
        const originalPO = mockData.purchaseOrders.find(p => p.id === poId);
        if (originalPO) {
            originalPO.status = po.destination === 'Warehouse' ? 'received' : 'delivered';
            originalPO.receivedAt = new Date();
            originalPO.receivedBy = 'admin1'; // Placeholder for current user
        }
        
        setOnOrderPOs(prev => prev.filter(p => p.id !== poId));
        
        toast({
            title: "Purchase Order Received",
            description: `${po.id.toUpperCase()} has been marked as received.`
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>On-Order</CardTitle>
                <CardDescription>Track all active purchase orders that have not yet been received.</CardDescription>
                {/* Add filtering controls here */}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>PO #</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Order Date</TableHead>
                            <TableHead>Expected Date</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPOs.length > 0 ? filteredPOs.map(po => (
                            <TableRow key={po.id}>
                                <TableCell className="font-medium">{po.id.toUpperCase()}</TableCell>
                                <TableCell>{po.vendor}</TableCell>
                                <TableCell>{format(new Date(po.orderDate), 'PP')}</TableCell>
                                <TableCell>{po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), 'PP') : 'N/A'}</TableCell>
                                <TableCell>{po.destinationName}</TableCell>
                                <TableCell><Badge className={cn('capitalize', getStatusStyles(po.status))}>{po.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" onClick={() => handleMarkAsReceived(po.id)}>
                                        <CheckCheck className="mr-2 h-4 w-4" />
                                        Mark as Received
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">No active purchase orders.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
