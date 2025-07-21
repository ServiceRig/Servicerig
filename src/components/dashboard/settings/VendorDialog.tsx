
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Vendor } from '@/lib/types';

interface VendorDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    vendor: Vendor | null;
    onSave: (vendor: Vendor) => void;
}

export function VendorDialog({ isOpen, onOpenChange, vendor, onSave }: VendorDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Vendor>>({});

    useEffect(() => {
        if (vendor) {
            setFormData(vendor);
        } else {
            setFormData({}); // Reset for new vendor
        }
    }, [vendor, isOpen]);

    const handleInputChange = (field: keyof Vendor, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.name) {
            toast({
                variant: 'destructive',
                title: 'Name is required',
                description: 'Please provide a name for the vendor.',
            });
            return;
        }
        onSave(formData as Vendor);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                    <DialogDescription>
                        {vendor ? `Editing details for ${vendor.name}` : 'Enter the details for the new supplier.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contactName" className="text-right">Contact</Label>
                        <Input id="contactName" value={formData.contactName || ''} onChange={e => handleInputChange('contactName', e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Phone</Label>
                        <Input id="phone" value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="notes" className="text-right mt-2">Notes</Label>
                        <Textarea id="notes" value={formData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save Vendor</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
