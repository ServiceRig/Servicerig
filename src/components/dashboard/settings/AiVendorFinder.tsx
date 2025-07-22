
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Wand2, Loader2, PlusCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { findVendors, type FindVendorsOutput } from '@/ai/flows/find-vendors';
import { addVendor } from '@/app/actions';
import type { Vendor } from '@/lib/types';

interface AiVendorFinderProps {
    onVendorAdded: (vendor: Vendor) => void;
}

type VendorResult = FindVendorsOutput['vendors'][0];

async function findVendorsAction(prevState: any, formData: FormData): Promise<{data?: FindVendorsOutput, error?: string}> {
    const query = formData.get('query') as string;
    if (!query) {
        return { error: 'Please enter a search query.' };
    }
    try {
        const results = await findVendors(query);
        return { data: results };
    } catch (e: any) {
        console.error("Error finding vendors:", e);
        return { error: e.message || 'An unexpected error occurred.' };
    }
}

function SearchButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {pending ? 'Searching...' : 'Find Vendors'}
        </Button>
    )
}

function AddVendorButton({ vendor }: { vendor: VendorResult }) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(addVendor, { success: false, message: '' });
    
    useState(() => {
        if (state.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
        }
    });

    return (
        <form action={formAction}>
            <input type="hidden" name="vendorData" value={JSON.stringify(vendor)} />
            <Button type="submit" size="sm" variant="secondary" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add to Catalog
            </Button>
        </form>
    )
}

export function AiVendorFinder({ onVendorAdded }: AiVendorFinderProps) {
    const [state, formAction] = useActionState(findVendorsAction, {});
    const { toast } = useToast();
    
    useState(() => {
        if (state.data) {
             toast({
                title: 'Vendors Found',
                description: `Found ${state.data.vendors.length} potential vendors.`,
            });
        } else if (state.error) {
             toast({
                variant: 'destructive',
                title: 'Search Error',
                description: state.error,
            });
        }
    }, [state, toast]);

    return (
        <Card className="shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle>AI Vendor Discovery</CardTitle>
                <CardDescription>Find new suppliers by describing what you need and where.</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent>
                    <Label htmlFor="vendor-query" className="sr-only">Vendor Search Query</Label>
                    <Input 
                        id="vendor-query"
                        name="query"
                        placeholder="e.g., plumbing supply near Greenville, TX"
                    />
                </CardContent>
                <CardFooter>
                    <SearchButton />
                </CardFooter>
            </form>
            {state.data && state.data.vendors.length > 0 && (
                <CardContent className="border-t pt-6">
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Results Found</AlertTitle>
                        <AlertDescription>Review the vendors below and add them to your catalog.</AlertDescription>
                    </Alert>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {state.data.vendors.map((vendor, index) => (
                            <Card key={index} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{vendor.name}</CardTitle>
                                    <CardDescription>{vendor.locations[0]?.address}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow text-sm text-muted-foreground space-y-2">
                                    <p><strong>Phone:</strong> {vendor.phone || 'N/A'}</p>
                                    <p><strong>Website:</strong> {vendor.website ? <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Link</a> : 'N/A'}</p>
                                    <p><strong>Trades:</strong> {(vendor.trades || []).join(', ') || 'N/A'}</p>
                                    <p><strong>Note:</strong> {vendor.notes || 'N/A'}</p>
                                </CardContent>
                                <CardFooter>
                                    <AddVendorButton vendor={vendor} />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
