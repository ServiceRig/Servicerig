
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Pencil, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateInventoryItem } from '@/app/actions';
import type { InventoryItem } from '@/lib/types';

interface EditInventoryItemDialogProps {
  item: InventoryItem;
  onUpdate: (updates: { inventoryItems: InventoryItem[] }) => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    )
}

export function EditInventoryItemDialog({ item, onUpdate }: EditInventoryItemDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [state, formAction] = useActionState(updateInventoryItem, { success: false, message: '' });

    useEffect(() => {
        if (state?.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success && state.inventoryItems) {
                onUpdate({ inventoryItems: state.inventoryItems });
                setIsOpen(false);
            }
        }
    }, [state, toast, onUpdate]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Item: {item.name}</DialogTitle>
                    <DialogDescription>Update the details for this inventory item.</DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Part Name</Label>
                            <Input id="name" name="name" defaultValue={item.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" name="sku" defaultValue={item.sku} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="partNumber">Part Number</Label>
                            <Input id="partNumber" name="partNumber" defaultValue={item.partNumber} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="modelNumber">Model Number</Label>
                            <Input id="modelNumber" name="modelNumber" defaultValue={item.modelNumber} />
                        </div>
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
