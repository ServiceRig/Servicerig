
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockData } from '@/lib/mock-data';
import type { InventoryItem, Equipment, Technician } from '@/lib/types';
import { StatCard } from '../stat-card';
import { DollarSign, Warehouse, Truck, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export function AssetValue({ searchTerm }: { searchTerm: string }) {
    const { inventoryItems, equipment, technicians } = mockData;

    const calculations = useMemo(() => {
        const warehouseStockValue = (inventoryItems as InventoryItem[]).reduce((sum, item) => sum + (item.quantityOnHand * item.unitCost), 0);

        const truckStockValueByTech = (technicians as Technician[]).map(tech => {
            const stockValue = (inventoryItems as InventoryItem[]).reduce((sum, item) => {
                const truckStock = item.truckLocations?.find(loc => loc.technicianId === tech.id);
                return sum + ((truckStock?.quantity || 0) * item.unitCost);
            }, 0);
            return { techId: tech.id, techName: tech.name, value: stockValue };
        });

        const totalTruckStockValue = truckStockValueByTech.reduce((sum, tech) => sum + tech.value, 0);

        const equipmentValueByTech = (technicians as Technician[]).map(tech => {
            const ownedEquipmentValue = (equipment as Equipment[]).reduce((sum, eq) => {
                if (eq.technicianId === tech.id) {
                    return sum + (eq.purchasePrice || 0);
                }
                return sum;
            }, 0);
            return { techId: tech.id, techName: tech.name, value: ownedEquipmentValue };
        });

        const totalEquipmentValue = equipmentValueByTech.reduce((sum, tech) => sum + tech.value, 0);

        const valueByVendor = (inventoryItems as InventoryItem[]).reduce((acc, item) => {
            const vendor = item.vendor || 'Unknown';
            const itemValue = item.quantityOnHand * item.unitCost;
            acc[vendor] = (acc[vendor] || 0) + itemValue;
            return acc;
        }, {} as Record<string, number>);

        const valueByTrade = (inventoryItems as InventoryItem[]).reduce((acc, item) => {
            const trade = item.trade || 'General';
            const itemValue = item.quantityOnHand * item.unitCost;
            acc[trade] = (acc[trade] || 0) + itemValue;
            return acc;
        }, {} as Record<string, number>);

        return {
            warehouseStockValue,
            totalTruckStockValue,
            totalEquipmentValue,
            totalAssetValue: warehouseStockValue + totalTruckStockValue + totalEquipmentValue,
            truckStockValueByTech: truckStockValueByTech.filter(t => t.value > 0),
            equipmentValueByTech: equipmentValueByTech.filter(t => t.value > 0),
            valueByVendor: Object.entries(valueByVendor).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
            valueByTrade: Object.entries(valueByTrade).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
        };
    }, [inventoryItems, equipment, technicians]);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Asset Value" value={formatCurrency(calculations.totalAssetValue)} icon={DollarSign} change="Inventory + Equipment" />
                <StatCard title="Warehouse Inventory" value={formatCurrency(calculations.warehouseStockValue)} icon={Warehouse} change="Value of on-hand parts" />
                <StatCard title="Truck Stock Value" value={formatCurrency(calculations.totalTruckStockValue)} icon={Truck} change="Value of parts on trucks" />
                <StatCard title="Equipment Value" value={formatCurrency(calculations.totalEquipmentValue)} icon={Wrench} change="Value of tools & devices" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Asset Value by Technician</CardTitle>
                        <CardDescription>Total value of parts and equipment assigned to each technician.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={calculations.truckStockValueByTech.map((t, i) => ({ name: t.techName, truckStock: t.value, equipment: calculations.equipmentValueByTech[i]?.value || 0}))}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`}/>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="truckStock" fill="hsl(var(--primary))" name="Truck Stock" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="equipment" fill="hsl(var(--accent))" name="Equipment" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Inventory Value by Vendor</CardTitle>
                        <CardDescription>Breakdown of warehouse inventory value by supplier.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {calculations.valueByVendor.map(vendor => (
                                    <TableRow key={vendor.name}>
                                        <TableCell className="font-medium">{vendor.name}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(vendor.value)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
