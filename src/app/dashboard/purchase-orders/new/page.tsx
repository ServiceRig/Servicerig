
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, AlertCircle, Save, X, Package } from 'lucide-react';
import { mockData } from '@/lib/mock-data';
import type { PurchaseOrder, PurchaseOrderPart, InventoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type TempPoPart = PurchaseOrderPart & {
    itemName: string;
    vendor?: string;
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

function NewPurchaseOrderContent() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [poItems, setPoItems] = useState<TempPoPart[]>([]);

    useEffect(() => {
        const itemsParam = searchParams.get('items');
        if (itemsParam) {
            try {
                const parsedItems = JSON.parse(itemsParam);
                const itemsWithVendors = parsedItems.map((item: any) => {
                    const inventoryItem = mockData.inventoryItems.find((i: InventoryItem) => i.id === item.partId);
                    return { ...item, vendor: inventoryItem?.vendor || 'Unknown' };
                });
                setPoItems(itemsWithVendors);
            } catch (e) {
                console.error("Failed to parse PO items from URL", e);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load items for purchase order.' });
            }
        }
    }, [searchParams, toast]);

    const posByVendor = useMemo(() => {
        const vendorMap = new Map<string, TempPoPart[]>();
        poItems.forEach(item => {
            const vendor = item.vendor || 'Unknown Vendor';
            if (!vendorMap.has(vendor)) {
                vendorMap.set(vendor, []);
            }
            vendorMap.get(vendor)!.push(item);
        });
        return Array.from(vendorMap.entries());
    }, [poItems]);
    
    const handleQtyChange = (partId: string, newQty: number) => {
        setPoItems(prev => prev.map(item => item.partId === partId ? { ...item, qty: newQty } : item));
    }
    
    const handleRemoveItem = (partId: string) => {
        setPoItems(prev => prev.filter(item => item.partId !== partId));
    }

    const handleCreatePOs = () => {
        // In a real app, this would be a server action
        console.log("Creating POs:", posByVendor);
        toast({
            title: "Purchase Orders Created",
            description: `${posByVendor.length} POs have been created and are ready to be sent.`
        });
        // Here you would redirect to the main PO page or clear the state
    }

    if (poItems.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Items to Order</AlertTitle>
                <AlertDescription>Start by selecting items from the Shopping List.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Create Purchase Order</h1>
                    <p className="text-muted-foreground">Review items and create one or more purchase orders, grouped by vendor.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><X className="mr-2 h-4 w-4" /> Cancel</Button>
                    <Button onClick={handleCreatePOs}><Save className="mr-2 h-4 w-4" /> Create {posByVendor.length} PO(s)</Button>
                </div>
            </div>

            {posByVendor.map(([vendor, items], index) => (
                <Card key={index}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Package className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <CardTitle>Vendor: {vendor}</CardTitle>
                                <CardDescription>A purchase order will be generated for this vendor.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Part</TableHead>
                                    <TableHead className="w-32">Quantity</TableHead>
                                    <TableHead className="w-40 text-right">Unit Cost</TableHead>
                                    <TableHead className="w-40 text-right">Total</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map(item => (
                                    <TableRow key={item.partId}>
                                        <TableCell className="font-medium">{item.itemName}</TableCell>
                                        <TableCell><Input type="number" value={item.qty} onChange={(e) => handleQtyChange(item.partId, parseInt(e.target.value) || 0)}/></TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(item.qty * item.unitCost)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.partId)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <div className="text-xl font-bold">
                            PO Total: {formatCurrency(items.reduce((sum, item) => sum + (item.qty * item.unitCost), 0))}
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

export default function NewPurchaseOrderPage() {
    return (
        <Suspense fallback={<div>Loading items...</div>}>
            <NewPurchaseOrderContent />
        </Suspense>
    )
}
