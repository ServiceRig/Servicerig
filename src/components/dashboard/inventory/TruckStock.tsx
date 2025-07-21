
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockData } from '@/lib/mock-data';
import type { InventoryItem, Technician } from '@/lib/types';

type TruckStockItem = InventoryItem & {
    technicianId: string;
    technicianName: string;
    truckQuantity: number;
};

export function TruckStock({ searchTerm }: { searchTerm: string }) {
    const [technicians, setTechnicians] = useState<Technician[]>(mockData.technicians);
    const [selectedTech, setSelectedTech] = useState('all');

    const allTruckStock = useMemo(() => {
        return mockData.inventoryItems.flatMap((item: InventoryItem) => 
            (item.truckLocations || []).map(loc => {
                const tech = technicians.find(t => t.id === loc.technicianId);
                return {
                    ...item,
                    technicianId: loc.technicianId,
                    technicianName: tech?.name || 'Unknown',
                    truckQuantity: loc.quantity,
                };
            })
        );
    }, [technicians]);
    
    const filteredStock = useMemo(() => {
        return allTruckStock.filter(item => {
            const matchesTech = selectedTech === 'all' || item.technicianId === selectedTech;
            
            const lowercasedTerm = searchTerm.toLowerCase();
            const matchesSearch = searchTerm ? (
                item.name.toLowerCase().includes(lowercasedTerm) ||
                item.sku.toLowerCase().includes(lowercasedTerm) ||
                item.partNumber.toLowerCase().includes(lowercasedTerm)
            ) : true;
            
            return matchesTech && matchesSearch;
        });
    }, [allTruckStock, searchTerm, selectedTech]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Truck Stock Overview</CardTitle>
                <CardDescription>View inventory levels across all technician trucks.</CardDescription>
                <div className="pt-4">
                    <Select value={selectedTech} onValueChange={setSelectedTech}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Filter by technician..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Technicians</SelectItem>
                            {technicians.map(tech => (
                                <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Part Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Technician</TableHead>
                            <TableHead className="text-right">Quantity on Truck</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStock.length > 0 ? filteredStock.map(item => (
                            <TableRow key={`${item.id}-${item.technicianId}`}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell>{item.technicianName}</TableCell>
                                <TableCell className="text-right font-bold">{item.truckQuantity}</TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No truck stock found for the selected filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
