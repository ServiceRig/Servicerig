
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { mockData } from '@/lib/mock-data';
import type { Vendor } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { VendorDialog } from '@/components/dashboard/settings/VendorDialog';
import { VendorTable } from '@/components/dashboard/settings/VendorTable';

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>(mockData.vendors as Vendor[]);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSaveVendor = (vendor: Vendor) => {
        // This is where you would call a server action to save to Firestore
        if (selectedVendor) {
            // Update existing vendor
            setVendors(prev => prev.map(v => v.id === vendor.id ? vendor : v));
        } else {
            // Add new vendor
            setVendors(prev => [{ ...vendor, id: `vendor_${Date.now()}`, createdAt: new Date() }, ...prev]);
        }
    };

    const handleAddNew = () => {
        setSelectedVendor(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Vendor Catalog</h1>
                    <p className="text-muted-foreground">Manage your list of approved parts and materials suppliers.</p>
                </div>
                 <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Vendor
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                    <VendorTable vendors={vendors} onEdit={handleEdit} />
                </CardContent>
            </Card>

            <VendorDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                vendor={selectedVendor}
                onSave={handleSaveVendor}
            />
        </div>
    );
}
