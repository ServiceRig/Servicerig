
'use client';

import { useState, useTransition, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { findVendors, type FindVendorsOutput } from '@/ai/flows/find-vendors';
import { addVendor } from '@/app/actions';
import { Wand2, Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Vendor } from '@/lib/types';

interface AiVendorFinderProps {
    onVendorAdded: (updatedVendors: Vendor[]) => void;
}

function FindButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {pending ? 'Finding...' : 'Find Vendors'}
        </Button>
    )
}

function AddVendorButton({ vendor, onVendorAdded }: { vendor: FindVendorsOutput['vendors'][0], onVendorAdded: (vendors: Vendor[]) => void }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleAdd = () => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('name', vendor.name);
            formData.append('contactName', vendor.contactName);
            formData.append('phone', vendor.phone);
            formData.append('email', vendor.email);
            formData.append('website', vendor.website);
            formData.append('address', vendor.address);
            formData.append('trades', JSON.stringify(vendor.trades));
            formData.append('categories', JSON.stringify(vendor.categories));
            
            const result = await addVendor(null, formData);
            if (result.success && result.vendors) {
                toast({ title: "Success", description: result.message });
                onVendorAdded(result.vendors);
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
        });
    }

    return (
         <Button size="sm" onClick={handleAdd} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add to Catalog
        </Button>
    )
}


export function AiVendorFinder({ onVendorAdded }: AiVendorFinderProps) {
    const { toast } = useToast();
    const [query, setQuery] = useState('');
    const [isPending, startTransition] = useTransition();
    const [foundVendors, setFoundVendors] = useState<FindVendorsOutput['vendors'] | null>(null);

    const handleFindVendors = (formData: FormData) => {
        const query = formData.get('query') as string;
        if (!query) return;
        
        startTransition(async () => {
            setFoundVendors(null);
            try {
                const result = await findVendors({ query });
                if (result.vendors && result.vendors.length > 0) {
                    setFoundVendors(result.vendors);
                    toast({ title: 'Success', description: `Found ${result.vendors.length} potential vendors.` });
                } else {
                    toast({ title: 'No Results', description: 'Could not find any vendors matching your query.' });
                }
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'AI Error', description: 'Could not fetch vendor suggestions.' });
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Vendor Discovery</CardTitle>
                <CardDescription>
                    Find local suppliers and add them to your catalog with one click.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleFindVendors} className="flex flex-col md:flex-row gap-4">
                    <div className="grid gap-2 flex-grow">
                        <Label htmlFor="vendor-query" className="sr-only">Vendor Query</Label>
                        <Input
                            id="vendor-query"
                            name="query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., Plumbing supply house near Dallas, TX"
                        />
                    </div>
                    <FindButton />
                </form>

                {foundVendors && (
                    <div className="mt-6 space-y-4">
                        <h3 className="font-semibold">Suggested Vendors</h3>
                        {foundVendors.map((vendor, index) => (
                            <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg gap-4">
                                <div>
                                    <p className="font-bold">{vendor.name}</p>
                                    <p className="text-sm text-muted-foreground">{vendor.address}</p>
                                    <p className="text-sm text-muted-foreground">{vendor.phone}</p>
                                </div>
                                <AddVendorButton vendor={vendor} onVendorAdded={onVendorAdded} />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

