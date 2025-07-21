

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TaxZone } from '@/lib/types';
import { mockData } from '@/lib/mock-data';

const formatPercent = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
};

export default function TaxSettingsPage() {
    const { toast } = useToast();
    const [taxZones, setTaxZones] = useState<TaxZone[]>(mockData.taxZones);
    const [newZoneName, setNewZoneName] = useState('');
    const [newZoneRate, setNewZoneRate] = useState('');

    const handleAddZone = () => {
        if (!newZoneName || !newZoneRate) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide both a zone name and a rate.',
            });
            return;
        }

        const newZone: TaxZone = {
            id: `tax_${Date.now()}`,
            name: newZoneName,
            rate: parseFloat(newZoneRate) / 100,
        };

        // In a real app, this would be a server action
        setTaxZones(prev => [...prev, newZone]);
        setNewZoneName('');
        setNewZoneRate('');
        toast({
            title: 'Tax Zone Added',
            description: `Successfully added the "${newZoneName}" tax zone.`,
        });
    };
    
    const handleRemoveZone = (zoneId: string) => {
        // In a real app, this would be a server action
        setTaxZones(prev => prev.filter(zone => zone.id !== zoneId));
         toast({
            title: 'Tax Zone Removed',
            description: 'The tax zone has been removed.',
        });
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Tax Settings</h1>
                <p className="text-muted-foreground">Manage tax zones and rates for different regions.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Tax Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-2 flex-grow">
                            <Label htmlFor="zone-name">Zone Name</Label>
                            <Input id="zone-name" placeholder="e.g., California" value={newZoneName} onChange={e => setNewZoneName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zone-rate">Rate (%)</Label>
                            <Input id="zone-rate" type="number" placeholder="e.g., 8.25" value={newZoneRate} onChange={e => setNewZoneRate(e.target.value)} />
                        </div>
                        <Button onClick={handleAddZone}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Zone
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Configured Tax Zones</CardTitle>
                    <CardDescription>These are the tax rates that will be applied based on customer location.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Zone Name</TableHead>
                                <TableHead>Tax Rate</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taxZones.map(zone => (
                                <TableRow key={zone.id}>
                                    <TableCell className="font-medium">{zone.name}</TableCell>
                                    <TableCell>{formatPercent(zone.rate)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveZone(zone.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
