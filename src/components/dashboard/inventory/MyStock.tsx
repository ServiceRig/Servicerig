

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { InventoryItem, Job } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Truck, Wrench } from 'lucide-react';
import { LogPartUsageDialog } from './LogPartUsageDialog';
import { FieldPurchaseDialog } from './FieldPurchaseDialog';
import { EditInventoryItemDialog } from './EditInventoryItemDialog';

const LOGGED_IN_TECHNICIAN_ID = 'tech1';

type TruckStockItem = InventoryItem & {
    truckQuantity: number;
};

interface MyStockProps {
    searchTerm: string;
    inventoryItems: InventoryItem[];
    jobs: Job[];
    onDataUpdate: (updates: { inventory?: InventoryItem[], jobs?: Job[] }) => void;
}

export function MyStock({ searchTerm, inventoryItems, jobs, onDataUpdate }: MyStockProps) {
    const { toast } = useToast();
    
    const truckStock = useMemo(() => {
        return inventoryItems
            .map(item => {
                const truckInfo = item.truckLocations?.find(loc => loc.technicianId === LOGGED_IN_TECHNICIAN_ID);
                return truckInfo ? { ...item, truckQuantity: truckInfo.quantity } : null;
            })
            .filter((item): item is TruckStockItem => item !== null && item.truckQuantity > 0);
    }, [inventoryItems]);
    
    const technicianJobs = useMemo(() => {
        return jobs.filter(job => job.technicianId === LOGGED_IN_TECHNICIAN_ID);
    }, [jobs]);

    const handleRequestRestock = (item: TruckStockItem) => {
        // This is a placeholder for a future feature.
        toast({
            title: 'Restock Requested',
            description: `A request has been sent for ${item.name}.`,
        });
    }

    const filteredStock = useMemo(() => {
        if (!searchTerm) return truckStock;
        const lowercasedTerm = searchTerm.toLowerCase();
        return truckStock.filter(item => 
            item.name.toLowerCase().includes(lowercasedTerm) ||
            item.sku.toLowerCase().includes(lowercasedTerm) ||
            (item.partNumber && item.partNumber.toLowerCase().includes(lowercasedTerm)) ||
            (item.modelNumber && item.modelNumber.toLowerCase().includes(lowercasedTerm)) ||
            item.description.toLowerCase().includes(lowercasedTerm) ||
            item.category.toLowerCase().includes(lowercasedTerm) ||
            item.trade.toLowerCase().includes(lowercasedTerm)
        );
    }, [truckStock, searchTerm]);


    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>My Truck Stock</CardTitle>
                    <CardDescription>A list of all parts currently assigned to your truck.</CardDescription>
                </div>
                <FieldPurchaseDialog jobs={technicianJobs} onPurchaseLogged={(inventory) => onDataUpdate({ inventory })} />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Part Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Part #</TableHead>
                            <TableHead>Model #</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>On Truck</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStock.length > 0 ? filteredStock.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell>{item.partNumber}</TableCell>
                                <TableCell>{item.modelNumber}</TableCell>
                                <TableCell>{item.vendor}</TableCell>
                                <TableCell className="font-bold">{item.truckQuantity}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <LogPartUsageDialog 
                                        item={item} 
                                        technicianId={LOGGED_IN_TECHNICIAN_ID} 
                                        disabled={item.truckQuantity <= 0}
                                        onPartLogged={onDataUpdate}
                                    />
                                    <Button variant="secondary" size="sm" onClick={() => handleRequestRestock(item)}>
                                        <Truck className="mr-2 h-4 w-4" /> Restock
                                    </Button>
                                     <EditInventoryItemDialog item={item} onUpdate={(inventory) => onDataUpdate({ inventory })} />
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No stock found on your truck.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
