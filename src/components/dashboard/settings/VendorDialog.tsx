

'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Vendor } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface VendorDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    vendor: Vendor | null;
    onSave: (vendor: Vendor) => void;
}

const allTrades: Vendor['trades'] = ['Plumbing', 'HVAC', 'Electrical', 'General'];
const allDeliveryOptions: Vendor['deliveryOptions'] = ['Warehouse', 'Tech Truck'];

const initialFormData: Partial<Vendor> = {
    name: '',
    contactName: '',
    phone: '',
    email: '',
    website: '',
    paymentTerms: '',
    notes: '',
    preferred: false,
    trades: [],
    locations: [],
    portalUrl: '',
    deliveryOptions: [],
};

export function VendorDialog({ isOpen, onOpenChange, vendor, onSave }: VendorDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Vendor>>(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (vendor) {
                setFormData(vendor);
            } else {
                setFormData(initialFormData);
            }
        }
    }, [vendor, isOpen]);

    const handleInputChange = (field: keyof Omit<Vendor, 'trades' | 'deliveryOptions' | 'preferred'>, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxGroupChange = (field: 'trades' | 'deliveryOptions', value: string, checked: boolean) => {
        setFormData(prev => {
            const currentValues = (prev[field] as string[] | undefined) || [];
            if (checked) {
                return { ...prev, [field]: [...currentValues, value] };
            } else {
                return { ...prev, [field]: currentValues.filter(v => v !== value) };
            }
        });
    }

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
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                    <DialogDescription>
                        {vendor ? `Editing details for ${vendor.name}` : 'Enter the details for the new supplier.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input id="contactName" value={formData.contactName || ''} onChange={e => handleInputChange('contactName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="portalUrl">Ordering Portal URL</Label>
                        <Input id="portalUrl" value={formData.portalUrl || ''} onChange={e => handleInputChange('portalUrl', e.target.value)} placeholder="https://supplier.com/login" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <Input id="paymentTerms" value={formData.paymentTerms || ''} onChange={e => handleInputChange('paymentTerms', e.target.value)} placeholder="e.g., Net 30" />
                    </div>

                    <div className="space-y-2">
                        <Label>Trades Served</Label>
                        <div className="flex flex-wrap gap-4">
                            {allTrades.map(trade => (
                                <div key={trade} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`trade-${trade}`} 
                                        checked={(formData.trades || []).includes(trade)}
                                        onCheckedChange={(checked) => handleCheckboxGroupChange('trades', trade, !!checked)}
                                    />
                                    <Label htmlFor={`trade-${trade}`}>{trade}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                     <div className="space-y-2">
                        <Label>Delivery Options</Label>
                        <div className="flex flex-wrap gap-4">
                            {allDeliveryOptions.map(option => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`delivery-${option}`} 
                                        checked={(formData.deliveryOptions || []).includes(option)}
                                        onCheckedChange={(checked) => handleCheckboxGroupChange('deliveryOptions', option, !!checked)}
                                    />
                                    <Label htmlFor={`delivery-${option}`}>{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Switch id="preferred" checked={formData.preferred} onCheckedChange={(checked) => setFormData(prev => ({...prev, preferred: checked}))} />
                        <Label htmlFor="preferred">Mark as Preferred Vendor</Label>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" value={formData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} />
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
