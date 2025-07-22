

'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { mockData } from '@/lib/mock-data';
import type { Vendor } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { VendorDialog } from '@/components/dashboard/settings/VendorDialog';
import { VendorTable } from '@/components/dashboard/settings/VendorTable';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const allTrades = ['Plumbing', 'HVAC', 'Electrical', 'General'];

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>(mockData.vendors as Vendor[]);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [tradeFilter, setTradeFilter] = useState('all');
    const [preferredFilter, setPreferredFilter] = useState('all');

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

    const filteredVendors = useMemo(() => {
        return vendors.filter(vendor => {
            const matchesSearch = searchTerm ?
                vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (vendor.contactName && vendor.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;

            const matchesTrade = tradeFilter === 'all' || vendor.trades.includes(tradeFilter as any);
            const matchesPreferred = preferredFilter === 'all' || (preferredFilter === 'yes' && vendor.preferred) || (preferredFilter === 'no' && !vendor.preferred);

            return matchesSearch && matchesTrade && matchesPreferred;
        });
    }, [vendors, searchTerm, tradeFilter, preferredFilter]);


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
                    <div className="flex flex-col md:flex-row gap-4 mt-2">
                        <Input
                            placeholder="Search by name or contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Select value={tradeFilter} onValueChange={setTradeFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by trade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Trades</SelectItem>
                                {allTrades.map(trade => (
                                    <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={preferredFilter} onValueChange={setPreferredFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by preferred" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="yes">Preferred Only</SelectItem>
                                <SelectItem value="no">Not Preferred</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <VendorTable vendors={filteredVendors} onEdit={handleEdit} />
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
