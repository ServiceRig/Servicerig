
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

export function WarehouseStock({ searchTerm }: { searchTerm: string }) {
    const { toast } = useToast();
    const [stock, setStock] = useState<InventoryItem[]>(mockData.inventoryItems);

    const filteredStock = useMemo(() => {
        if (!searchTerm) return stock;
        const lowercasedTerm = searchTerm.toLowerCase();
        return stock.filter(item => 
            item.name.toLowerCase().includes(lowercasedTerm) ||
            item.sku.toLowerCase().includes(lowercasedTerm) ||
            item.partNumber.toLowerCase().includes(lowercasedTerm) ||
            item.modelNumber.toLowerCase().includes(lowercasedTerm) ||
            item.description.toLowerCase().includes(lowercasedTerm) ||
            item.category.toLowerCase().includes(lowercasedTerm) ||
            item.trade.toLowerCase().includes(lowercasedTerm)
        );
    }, [stock, searchTerm]);

    const handleAdjustStock = (itemId: string, adjustment: number) => {
        // In a real app, this would be a server action.
        setStock(prevStock => {
            const newStock = prevStock.map(item => {
                if (item.id === itemId) {
                    return { ...item, quantityOnHand: item.quantityOnHand + adjustment };
                }
                return item;
            });
            return newStock;
        });
        toast({ title: 'Stock Adjusted', description: 'Warehouse quantity has been updated.' });
    };

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
                                <TableCell className="font-bold">{item.quantityOnHand}</TableCell>
                                <TableCell>{item.warehouseLocation}</TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Button variant="outline" size="sm">
                                        <Truck className="mr-2 h-4 w-4" /> Issue to Tech
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <PackagePlus className="mr-2 h-4 w-4" /> Receive PO
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
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
