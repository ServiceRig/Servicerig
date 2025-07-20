
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function InventoryPage() {
    const tabs = [
        { id: 'my-stock', label: 'My Stock' },
        { id: 'my-equipment', label: 'My Equipment' },
        { id: 'my-requests', label: 'My Requests' },
        { id: 'pending-requests', label: 'Pending Requests' },
        { id: 'shopping-list', label: 'Shopping List' },
        { id: 'on-order', label: 'On-Order' },
        { id: 'completed', label: 'Completed' },
        { id: 'warehouse', label: 'Warehouse' },
        { id: 'equipment-log', label: 'Equipment Log' },
        { id: 'asset-value', label: 'Asset Value' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Inventory & Procurement</h1>
                    <p className="text-muted-foreground">Manage your parts, equipment, and purchase orders.</p>
                </div>
                 <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by Part #, SKU, Name..." className="pl-10" />
                </div>
            </div>

            <Tabs defaultValue="my-stock" className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 h-auto">
                    {tabs.map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
                    ))}
                </TabsList>
                
                {tabs.map(tab => (
                    <TabsContent key={tab.id} value={tab.id}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{tab.label}</CardTitle>
                                <CardDescription>Content for {tab.label} is coming soon.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-muted-foreground py-16">
                                    Feature under construction.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
