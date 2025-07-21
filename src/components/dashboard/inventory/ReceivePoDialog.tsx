
'use client';

import { useState, useEffect, useMemo, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PackagePlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { receivePurchaseOrder } from '@/app/actions';
import type { InventoryItem, PurchaseOrder } from '@/lib/types';
import { mockData } from '@/lib/mock-data';
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ReceivePoDialogProps {
  item: InventoryItem;
  onUpdate: () => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
            {pending ? 'Receiving...' : 'Receive Selected PO'}
        </Button>
    )
}

export function ReceivePoDialog({ item, onUpdate }: ReceivePoDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [state, formAction] = useActionState(receivePurchaseOrder, { success: false, message: '' });

    const openPOs = useMemo(() => {
        return (mockData.purchaseOrders as PurchaseOrder[]).filter(po => 
            (po.status === 'ordered' || po.status === 'pending') && 
            po.parts.some(p => p.partId === item.id)
        );
    }, [item.id]);

    useEffect(() => {
        if (!isOpen) return;

        if (state?.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                onUpdate();
                setIsOpen(false);
            }
        }
    }, [state, toast, onUpdate, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <PackagePlus className="mr-2 h-4 w-4" /> Receive PO
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Receive Item: {item.name}</DialogTitle>
                    <DialogDescription>Select an open purchase order to receive these items against.</DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <div className="space-y-4 py-4">
                        {openPOs.length > 0 ? (
                            <RadioGroup name="poId" className="space-y-2">
                                {openPOs.map(po => {
                                    const part = po.parts.find(p => p.partId === item.id);
                                    return (
                                        <Label key={po.id} htmlFor={po.id} className="flex items-center gap-4 border p-3 rounded-md cursor-pointer hover:bg-muted/50 has-[:checked]:bg-accent/20 has-[:checked]:border-accent">
                                            <RadioGroupItem value={po.id} id={po.id} />
                                            <div>
                                                <p className="font-semibold">PO {po.id.toUpperCase()}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Qty: {part?.qty} | Vendor: {po.vendor} | Ordered: {format(new Date(po.orderDate), 'PP')}
                                                </p>
                                            </div>
                                        </Label>
                                    )
                                })}
                            </RadioGroup>
                        ) : (
                            <p className="text-center text-muted-foreground">No open purchase orders found for this item.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
