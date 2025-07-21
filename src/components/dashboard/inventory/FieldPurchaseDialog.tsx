
'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Camera, UploadCloud, FilePlus, ShoppingCart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Job, InventoryItem } from '@/lib/types';
import { addFieldPurchase } from '@/app/actions';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type TempPart = {
    id: string;
    name: string;
    sku: string;
    partNumber: string;
    modelNumber: string;
    qty: number;
    unitCost: number;
};

interface FieldPurchaseDialogProps {
    jobs: Job[];
    onPurchaseLogged: () => void;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending || disabled}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus className="mr-2 h-4 w-4" />}
            {pending ? 'Logging...' : 'Log Field Purchase'}
        </Button>
    )
}

export function FieldPurchaseDialog({ jobs, onPurchaseLogged }: FieldPurchaseDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [state, formAction] = useActionState(addFieldPurchase, { success: false, message: '' });
    
    const [selectedJobId, setSelectedJobId] = useState('');
    const [parts, setParts] = useState<TempPart[]>([]);
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [totalCost, setTotalCost] = useState(0);
    const [vendorName, setVendorName] = useState('');
    
    const resetForm = () => {
        setSelectedJobId('');
        setParts([]);
        setReceiptImage(null);
        setTotalCost(0);
        setVendorName('');
    }
    
    useEffect(() => {
        if (state?.message) {
             toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if(state.success) {
                onPurchaseLogged();
                setIsOpen(false);
                resetForm();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    const handleAddPart = () => {
        setParts(prev => [...prev, { 
            id: `new_${Date.now()}`, 
            name: '', 
            sku: 'FIELD',
            partNumber: 'FIELD',
            modelNumber: 'FIELD',
            qty: 1, 
            unitCost: 0 
        }]);
    };

    const handlePartChange = (index: number, field: keyof TempPart, value: string | number) => {
        setParts(prev => {
            const newParts = [...prev];
            const part = { ...newParts[index] };
            
            if (typeof value === 'string' && (field === 'qty' || field === 'unitCost')) {
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
            <DialogContent className="sm:max-w-4xl">
                 <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-6 w-6"/>Log a Field Purchase</DialogTitle>
                    <DialogDescription>Track parts bought on the go and assign them to a job or your truck stock.</DialogDescription>
                </DialogHeader>
                <form action={formAction}>
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
                                {parts.map((part, index) => (
                                    <div key={part.id} className="grid grid-cols-[2fr,1fr,1fr,0.5fr,auto] items-center gap-2">
                                        <Input placeholder="Part name" value={part.name} onChange={(e) => handlePartChange(index, 'name', e.target.value)} />
                                        <Input placeholder="SKU" value={part.sku} onChange={(e) => handlePartChange(index, 'sku', e.target.value)} />
                                        <Input placeholder="Part #" value={part.partNumber} onChange={(e) => handlePartChange(index, 'partNumber', e.target.value)} />
                                        <Input type="number" placeholder="Qty" value={part.qty} onChange={(e) => handlePartChange(index, 'qty', e.target.value)} />
                                        <Input type="number" placeholder="Unit Cost" value={part.unitCost} onChange={(e) => handlePartChange(index, 'unitCost', e.target.value)} />
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
                                    <Button type="button" variant="outline" onClick={() => (document.getElementById('receiptFile') as HTMLInputElement)?.click()}><UploadCloud className="mr-2 h-4 w-4" /> Upload</Button>
                                    <input type="file" id="receiptFile" name="receiptFile" accept="image/*" onChange={handleImageUpload} className="hidden" />
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
