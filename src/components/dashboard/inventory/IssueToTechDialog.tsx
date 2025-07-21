

'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { issueStockToTechnician } from '@/app/actions';
import type { InventoryItem, Technician } from '@/lib/types';
import { mockData } from '@/lib/mock-data';

interface IssueToTechDialogProps {
  item: InventoryItem;
  onUpdate: (updatedInventory: InventoryItem[]) => void;
}

function SubmitButton({ maxQuantity }: { maxQuantity: number }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending || maxQuantity <= 0}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
            {pending ? 'Issuing...' : 'Issue to Technician'}
        </Button>
    )
}

export function IssueToTechDialog({ item, onUpdate }: IssueToTechDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [state, formAction] = useActionState(issueStockToTechnician, { success: false, message: '', inventory: [] });
    
    useEffect(() => {
        if (!isOpen) return;

        if (state?.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success && state.inventory) {
                onUpdate(state.inventory);
                setIsOpen(false);
            }
        }
    }, [state, toast, onUpdate, isOpen]);

    const technicians = mockData.technicians as Technician[];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Truck className="mr-2 h-4 w-4" /> Issue to Tech
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Issue {item.name}</DialogTitle>
                    <DialogDescription>
                        Transfer stock from the warehouse to a technician's truck.
                        Available warehouse quantity: {item.quantityOnHand}.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="technicianId">Technician</Label>
                             <Select name="technicianId" required>
                                <SelectTrigger id="technicianId">
                                    <SelectValue placeholder="Select a technician" />
                                </SelectTrigger>
                                <SelectContent>
                                    {technicians.map(tech => (
                                        <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity to Issue</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                required
                                defaultValue="1"
                                max={item.quantityOnHand}
                                min="1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton maxQuantity={item.quantityOnHand} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
