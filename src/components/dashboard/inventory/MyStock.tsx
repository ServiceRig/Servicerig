
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { mockData } from '@/lib/mock-data';
import type { InventoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Truck, Package, Wrench } from 'lucide-react';

const LOGGED_IN_TECHNICIAN_ID = 'tech1';

type TruckStockItem = InventoryItem & {
    truckQuantity: number;
};

export function MyStock({ searchTerm }: { searchTerm: string }) {
    const { toast } = useToast();
    const [truckStock, setTruckStock] = useState<TruckStockItem[]>(() => {
        return mockData.inventoryItems
            .map(item => {
                const truckInfo = item.truckLocations?.find(loc => loc.technicianId === LOGGED_IN_TECHNICIAN_ID);
                return truckInfo ? { ...item, truckQuantity: truckInfo.quantity } : null;
            })
            .filter((item): item is TruckStockItem => item !== null);
    });
    
    const handleUsePart = (itemId: string) => {
        setTruckStock(prevStock => {
            return prevStock.map(item => {
                if (item.id === itemId && item.truckQuantity > 0) {
                     toast({
                        title: 'Part Used',
                        description: `1 x ${item.name} has been marked as used.`,
                    });
                    return { ...item, truckQuantity: item.truckQuantity - 1 };
                }
                return item;
            });
        });
        // In a real app, you would also update the master inventory record in Firestore.
    }
    
    const handleRequestRestock = (item: TruckStockItem) => {
        const requestQty = item.reorderQtyDefault || 1;
        // In a real app, this would be a server action to create a part request.
         mockData.partRequests.unshift({
            id: `req_${Date.now()}`,
            technicianId: LOGGED_IN_TECHNICIAN_ID,
            technicianName: 'John Doe',
            itemId: item.id,
            itemName: item.name,
            quantity: requestQty,
            status: 'pending',
            createdAt: new Date(),
        });

        toast({
            title: 'Restock Requested',
            description: `A request for ${requestQty} x ${item.name} has been sent.`,
        });
    }

    const filteredStock = useMemo(() => {
        if (!searchTerm) return truckStock;
        return truckStock.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [truckStock, searchTerm]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>My Truck Stock</CardTitle>
                <CardDescription>A list of all parts currently assigned to your truck.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Part Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>On Truck</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStock.length > 0 ? filteredStock.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell className="font-bold">{item.truckQuantity}</TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Button variant="outline" size="sm" onClick={() => handleUsePart(item.id)} disabled={item.truckQuantity <= 0}>
                                        <Wrench className="mr-2 h-4 w-4" /> Use Part
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => handleRequestRestock(item)}>
                                        <Truck className="mr-2 h-4 w-4" /> Restock
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No stock found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
