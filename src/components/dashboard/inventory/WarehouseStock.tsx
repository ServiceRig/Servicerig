

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockData } from '@/lib/mock-data';
import type { InventoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Truck, PackagePlus, Pencil } from 'lucide-react';
import { IssueToTechDialog } from './IssueToTechDialog';
import { ReceivePoDialog } from './ReceivePoDialog';
import { EditInventoryItemDialog } from './EditInventoryItemDialog';

export function WarehouseStock({ searchTerm, inventoryItems, onDataUpdate }: { searchTerm: string, inventoryItems: InventoryItem[], onDataUpdate: (updatedInventory: InventoryItem[]) => void }) {

    const filteredStock = useMemo(() => {
        if (!searchTerm) return inventoryItems;
        const lowercasedTerm = searchTerm.toLowerCase();
        return inventoryItems.filter(item => 
            item.name.toLowerCase().includes(lowercasedTerm) ||
            item.sku.toLowerCase().includes(lowercasedTerm) ||
            item.partNumber.toLowerCase().includes(lowercasedTerm) ||
            item.modelNumber.toLowerCase().includes(lowercasedTerm) ||
            item.description.toLowerCase().includes(lowercasedTerm) ||
            item.category.toLowerCase().includes(lowercasedTerm) ||
            item.trade.toLowerCase().includes(lowercasedTerm) ||
            (item.vendor && item.vendor.toLowerCase().includes(lowercasedTerm))
        );
    }, [inventoryItems, searchTerm]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Warehouse Stock</CardTitle>
                <CardDescription>A complete list of all parts in the central warehouse.</CardDescription>
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
                            <TableHead>On Hand</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStock.length > 0 ? filteredStock.map(item => (
                            <TableRow key={item.id} className={item.quantityOnHand <= item.reorderThreshold ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell>{item.partNumber}</TableCell>
                                <TableCell>{item.modelNumber}</TableCell>
                                <TableCell>{item.vendor}</TableCell>
                                <TableCell className="font-bold">{item.quantityOnHand}</TableCell>
                                <TableCell>{item.warehouseLocation}</TableCell>
                                <TableCell className="text-right space-x-2">
                                     <IssueToTechDialog item={item} onUpdate={onDataUpdate} />
                                     <ReceivePoDialog item={item} onUpdate={onDataUpdate} />
                                     <EditInventoryItemDialog item={item} onUpdate={onDataUpdate} />
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
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
