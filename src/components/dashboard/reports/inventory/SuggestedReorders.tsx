
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { mockData } from '@/lib/mock-data';
import type { PartUsageLog, InventoryItem } from '@/lib/types';
import { subDays } from 'date-fns';

type ReorderSuggestion = {
    partId: string;
    partName: string;
    thirtyDayUsage: number;
    currentStock: number;
    reorderThreshold: number;
    suggestedQuantity: number;
};

export function SuggestedReorders() {
    const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>(() => {
        const thirtyDaysAgo = subDays(new Date(), 30);
        const usageLast30Days = mockData.partUsageLogs.filter(log => new Date(log.timestamp) > thirtyDaysAgo);

        const usageMap = new Map<string, number>();
        usageLast30Days.forEach(log => {
            usageMap.set(log.partId, (usageMap.get(log.partId) || 0) + log.quantity);
        });
        
        const reorderSuggestions: ReorderSuggestion[] = [];
        mockData.inventoryItems.forEach(item => {
            const thirtyDayUsage = usageMap.get(item.id) || 0;
            // Suggest reorder if stock is low or if usage is high compared to stock
            if (item.quantityOnHand < item.reorderThreshold || thirtyDayUsage > item.quantityOnHand) {
                reorderSuggestions.push({
                    partId: item.id,
                    partName: item.name,
                    thirtyDayUsage,
                    currentStock: item.quantityOnHand,
                    reorderThreshold: item.reorderThreshold,
                    suggestedQuantity: Math.max(item.reorderQtyDefault, thirtyDayUsage),
                });
            }
        });
        
        return reorderSuggestions;
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Suggested Reorders</CardTitle>
                <CardDescription>AI-powered reorder suggestions based on 30-day usage.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Part</TableHead>
                            <TableHead>30d Use</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Suggestion</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suggestions.map(item => (
                            <TableRow key={item.partId}>
                                <TableCell className="font-medium">{item.partName}</TableCell>
                                <TableCell>{item.thirtyDayUsage}</TableCell>
                                <TableCell>{item.currentStock}</TableCell>
                                <TableCell className="text-right font-bold text-accent">{item.suggestedQuantity}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <Button className="w-full mt-4">Add All to Shopping List</Button>
            </CardContent>
        </Card>
    );
}
