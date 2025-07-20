
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useRole, UserRole } from '@/hooks/use-role';

const allTabs = [
    { id: 'my-stock', label: 'My Stock', roles: [UserRole.Technician] },
    { id: 'my-equipment', label: 'My Equipment', roles: [UserRole.Technician] },
    { id: 'my-requests', label: 'My Requests', roles: [UserRole.Technician] },
    { id: 'pending-requests', label: 'Pending Requests', roles: [UserRole.Dispatcher, UserRole.Admin] },
    { id: 'shopping-list', label: 'Shopping List', roles: [UserRole.Dispatcher, UserRole.Admin] },
    { id: 'on-order', label: 'On-Order', roles: [UserRole.Dispatcher, UserRole.Admin] },
    { id: 'completed', label: 'Completed', roles: [UserRole.Dispatcher, UserRole.Admin] },
    { id: 'warehouse', label: 'Warehouse', roles: [UserRole.Admin] },
    { id: 'equipment-log', label: 'Equipment Log', roles: [UserRole.Admin] },
    { id: 'asset-value', label: 'Asset Value', roles: [UserRole.Admin] },
];

export default function InventoryPage() {
    const { role } = useRole();
    const [searchTerm, setSearchTerm] = useState('');

    const visibleTabs = useMemo(() => {
        if (!role) return [];
        if (role === UserRole.Admin) return allTabs;
        return allTabs.filter(tab => tab.roles.includes(role));
    }, [role]);

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
                        placeholder="Search by Part #, SKU, Name, Category..." 
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
                
                {visibleTabs.map(tab => (
                    <TabsContent key={tab.id} value={tab.id}>
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
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
