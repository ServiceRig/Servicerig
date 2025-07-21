

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRole, UserRole } from '@/hooks/use-role';
import { MyStock } from '@/components/dashboard/inventory/MyStock';
import { MyRequests } from '@/components/dashboard/inventory/MyRequests';
import { PendingRequests } from '@/components/dashboard/inventory/PendingRequests';
import { WarehouseStock } from '@/components/dashboard/inventory/WarehouseStock';
import { ShoppingList } from '@/components/dashboard/inventory/ShoppingList';
import { EquipmentLog } from '@/components/dashboard/inventory/EquipmentLog';
import { AssetValue } from '@/components/dashboard/inventory/AssetValue';
import { MyEquipment } from '@/components/dashboard/inventory/MyEquipment';
import { OnOrder } from '@/components/dashboard/inventory/OnOrder';
import { CompletedOrders } from '@/components/dashboard/inventory/CompletedOrders';
import { TruckStock } from '@/components/dashboard/inventory/TruckStock';
import { mockData } from '@/lib/mock-data';
import type { InventoryItem, Equipment, EquipmentLog as EquipmentLogType, PurchaseOrder } from '@/lib/types';


const allTabs = [
    { id: 'my-stock', label: 'My Truck Stock', roles: [UserRole.Technician], component: MyStock },
    { id: 'my-equipment', label: 'My Equipment', roles: [UserRole.Technician], component: MyEquipment },
    { id: 'my-requests', label: 'My Requests', roles: [UserRole.Technician], component: MyRequests },
    { id: 'pending-requests', label: 'Pending Requests', roles: [UserRole.Dispatcher, UserRole.Admin], component: PendingRequests },
    { id: 'shopping-list', label: 'Shopping List', roles: [UserRole.Dispatcher, UserRole.Admin], component: ShoppingList },
    { id: 'on-order', label: 'On-Order', roles: [UserRole.Dispatcher, UserRole.Admin], component: OnOrder },
    { id: 'completed', label: 'Completed', roles: [UserRole.Dispatcher, UserRole.Admin], component: CompletedOrders },
    { id: 'warehouse', label: 'Warehouse', roles: [UserRole.Admin], component: WarehouseStock },
    { id: 'truck-stock', label: 'Truck Stock', roles: [UserRole.Admin, UserRole.Dispatcher], component: TruckStock },
    { id: 'equipment-log', label: 'Equipment Log', roles: [UserRole.Admin], component: EquipmentLog },
    { id: 'asset-value', label: 'Asset Value', roles: [UserRole.Admin], component: AssetValue },
];

export default function InventoryPage() {
    const { role } = useRole();
    const [searchTerm, setSearchTerm] = useState('');

    // Centralized state management for inventory data
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockData.inventoryItems as InventoryItem[]);
    const [equipment, setEquipment] = useState<Equipment[]>(mockData.equipment as Equipment[]);
    const [equipmentLogs, setEquipmentLogs] = useState<EquipmentLogType[]>(mockData.equipmentLogs as EquipmentLogType[]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockData.purchaseOrders as PurchaseOrder[]);

    const visibleTabs = useMemo(() => {
        if (!role) return [];
        if (role === UserRole.Admin) return allTabs;
        return allTabs.filter(tab => tab.roles.includes(role));
    }, [role]);

    const handleDataUpdate = (updates: {
        inventoryItems?: InventoryItem[];
        equipment?: Equipment[];
        equipmentLogs?: EquipmentLogType[];
        purchaseOrders?: PurchaseOrder[];
    }) => {
        if (updates.inventoryItems) setInventoryItems(updates.inventoryItems);
        if (updates.equipment) setEquipment(updates.equipment);
        if (updates.equipmentLogs) setEquipmentLogs(updates.equipmentLogs);
        if (updates.purchaseOrders) setPurchaseOrders(updates.purchaseOrders);
    };

    if (!role || visibleTabs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Loading or no inventory view available for your role.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Inventory & Procurement</h1>
                    <p className="text-muted-foreground">Manage your parts, equipment, and purchase orders.</p>
                </div>
                 <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by Part #, SKU, Name..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue={visibleTabs[0].id} className="w-full">
                <TabsList className="grid w-full h-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {visibleTabs.map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
                    ))}
                </TabsList>
                
                {visibleTabs.map(tab => {
                    const TabComponent = tab.component;
                    return (
                        <TabsContent key={tab.id} value={tab.id} className="mt-4">
                            {TabComponent ? (
                                <TabComponent 
                                    searchTerm={searchTerm} 
                                    // Pass relevant state and update handlers to each component
                                    inventoryItems={inventoryItems}
                                    equipment={equipment}
                                    equipmentLogs={equipmentLogs}
                                    purchaseOrders={purchaseOrders}
                                    onDataUpdate={handleDataUpdate}
                                />
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{tab.label}</CardTitle>
                                        <CardDescription>Content for {tab.label.toLowerCase()} will be displayed here.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                                            <p className="text-muted-foreground">
                                                Feature under construction.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    )
                })}
            </Tabs>
        </div>
    );
}
