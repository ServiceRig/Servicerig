
'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Camera, UploadCloud, FilePlus, ShoppingCart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Job, PurchaseOrder } from '@/lib/types';
import { mockData } from '@/lib/mock-data';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

type TempPart = {
    id: string;
    name: string;
    qty: number;
    unitCost: number;
};

export function FieldPurchase({ jobs }: { jobs: Job[] }) {
    const { toast } = useToast();
    const [selectedJobId, setSelectedJobId] = useState('');
    const [parts, setParts] = useState<TempPart[]>([]);
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [totalCost, setTotalCost] = useState(0);
    const [vendorName, setVendorName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddPart = () => {
        setParts(prev => [...prev, { id: `new_${Date.now()}`, name: '', qty: 1, unitCost: 0 }]);
    };

    const handlePartChange = (index: number, field: keyof TempPart, value: string | number) => {
        setParts(prev => {
            const newParts = [...prev];
            const part = { ...newParts[index] };
            if (typeof value === 'string' && field !== 'name') {
                (part as any)[field] = parseFloat(value) || 0;
            } else {
                (part as any)[field] = value;
            }
            newParts[index] = part;
            return newParts;
        });
    };

    const handleRemovePart = (index: number) => {
        setParts(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setReceiptImage(e.target?.result as string);
                toast({ title: 'Receipt Uploaded', description: 'The receipt image has been attached.' });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = () => {
        if (!selectedJobId || parts.length === 0 || !receiptImage || totalCost <= 0 || !vendorName) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a job and fill all required fields, including receipt photo.',
            });
            return;
        }

        setIsLoading(true);

        const newPO: PurchaseOrder = {
            id: `po_field_${Date.now()}`,
            vendor: vendorName,
            parts: parts.map(p => ({ partId: p.id, qty: p.qty, unitCost: p.unitCost })),
            total: totalCost,
            status: 'completed',
            destination: 'tech1', // This should be dynamic based on logged in user
            orderDate: new Date(),
            isFieldPurchase: true,
            jobId: selectedJobId,
            receiptImage: receiptImage,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Simulate server action
        setTimeout(() => {
            mockData.purchaseOrders.unshift(newPO);
            
            // Here you would also update truck stock quantities in a real DB
            // For now, we'll just log it
            console.log('New Field PO created:', newPO);
            console.log('Parts to add to truck stock:', parts);

            toast({ title: 'Field Purchase Logged', description: `PO ${newPO.id} has been created and marked as complete.` });

            // Reset form
            setSelectedJobId('');
            setParts([]);
            setReceiptImage(null);
            setTotalCost(0);
            setVendorName('');
            setIsLoading(false);
        }, 1000);
    };
    
    const canSubmit = selectedJobId && parts.length > 0 && receiptImage && totalCost > 0 && vendorName;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-6 w-6"/>Log a Field Purchase</CardTitle>
                <CardDescription>Track parts bought on the go and assign them to a job.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="job-select">Select Job</Label>
                        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                            <SelectTrigger id="job-select"><SelectValue placeholder="Link to a job..." /></SelectTrigger>
                            <SelectContent>
                                {jobs.map(job => <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="vendor-name">Vendor</Label>
                        <Input id="vendor-name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="e.g., Home Depot" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Parts Purchased</Label>
                    <div className="space-y-2 rounded-md border p-2">
                        {parts.map((part, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input placeholder="Part name" value={part.name} onChange={(e) => handlePartChange(index, 'name', e.target.value)} />
                                <Input type="number" placeholder="Qty" value={part.qty} onChange={(e) => handlePartChange(index, 'qty', e.target.value)} className="w-20" />
                                <Input type="number" placeholder="Cost" value={part.unitCost} onChange={(e) => handlePartChange(index, 'unitCost', e.target.value)} className="w-24" />
                                <Button variant="ghost" size="icon" onClick={() => handleRemovePart(index)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <Button variant="link" size="sm" onClick={handleAddPart}><PlusCircle className="mr-2 h-4 w-4" /> Add Part</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                        <Label>Receipt</Label>
                        <div className="flex items-center gap-4">
                            {receiptImage ? (
                                <Image src={receiptImage} alt="Receipt" width={80} height={80} className="rounded-md object-cover aspect-square" />
                            ) : (
                                <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><UploadCloud className="mr-2 h-4 w-4" /> Upload</Button>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="total-cost">Total Cost (from receipt)</Label>
                        <Input id="total-cost" type="number" value={totalCost || ''} onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)} placeholder="Enter exact total" />
                    </div>
                </div>

            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSubmit} disabled={!canSubmit || isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus className="mr-2 h-4 w-4" />}
                    Log Field Purchase
                </Button>
            </CardFooter>
        </Card>
    );
}
