
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Camera, UploadCloud, FilePlus, ShoppingCart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Job } from '@/lib/types';
import { addFieldPurchase } from '@/app/actions';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type TempPart = {
    id: string;
    name: string;
    qty: number;
    unitCost: number;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending || disabled}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus className="mr-2 h-4 w-4" />}
            {pending ? 'Logging...' : 'Log Field Purchase'}
        </Button>
    )
}

export function FieldPurchaseDialog({ jobs }: { jobs: Job[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [state, formAction] = useFormState(addFieldPurchase, { success: false, message: '' });

    const [selectedJobId, setSelectedJobId] = useState('');
    const [parts, setParts] = useState<TempPart[]>([]);
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [totalCost, setTotalCost] = useState(0);
    const [vendorName, setVendorName] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

     // This useEffect will run when the server action completes and the state updates.
    useEffect(() => {
        if (state?.message && !state.success) {
            toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive',
            });
        }
    }, [state, toast]);

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
    
    const canSubmit = parts.length > 0 && receiptImage && totalCost > 0 && vendorName;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Field Purchase
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                 <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-6 w-6"/>Log a Field Purchase</DialogTitle>
                    <DialogDescription>Track parts bought on the go and assign them to a job or your truck stock.</DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef}>
                    <input type="hidden" name="parts" value={JSON.stringify(parts)} />
                    <input type="hidden" name="receiptImage" value={receiptImage || ''} />
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="job-select">Link to Job (Optional)</Label>
                                <Select name="jobId" value={selectedJobId} onValueChange={setSelectedJobId}>
                                    <SelectTrigger id="job-select"><SelectValue placeholder="Select a job..." /></SelectTrigger>
                                    <SelectContent>
                                        {jobs.map(job => <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vendor-name">Vendor</Label>
                                <Input id="vendor-name" name="vendor" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="e.g., Home Depot" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Parts Purchased</Label>
                            <div className="space-y-2 rounded-md border p-2">
                                <div className="flex items-center gap-2 px-1 pb-2">
                                    <Label className="flex-grow">Part Name</Label>
                                    <Label className="w-20 text-center">Quantity</Label>
                                    <Label className="w-24 text-center">Unit Cost</Label>
                                    <div className="w-9"></div>
                                </div>
                                {parts.map((part, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input placeholder="Part name" value={part.name} onChange={(e) => handlePartChange(index, 'name', e.target.value)} />
                                        <Input type="number" placeholder="Qty" value={part.qty} onChange={(e) => handlePartChange(index, 'qty', e.target.value)} className="w-20" />
                                        <Input type="number" placeholder="Cost" value={part.unitCost} onChange={(e) => handlePartChange(index, 'unitCost', e.target.value)} className="w-24" />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePart(index)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="link" size="sm" onClick={handleAddPart}><PlusCircle className="mr-2 h-4 w-4" /> Add Part</Button>
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
                                    <Button type="button" variant="outline" onClick={() => (formRef.current?.querySelector('input[type=file]') as HTMLInputElement)?.click()}><UploadCloud className="mr-2 h-4 w-4" /> Upload</Button>
                                    <input type="file" name="receiptFile" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total-cost">Total Cost (from receipt)</Label>
                                <Input id="total-cost" name="total" type="number" value={totalCost || ''} onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)} placeholder="Enter exact total" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton disabled={!canSubmit} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
