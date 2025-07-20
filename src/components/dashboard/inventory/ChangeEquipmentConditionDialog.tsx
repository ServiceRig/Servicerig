
'use client';

import { useState, useEffect, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateEquipmentCondition } from '@/app/actions';
import type { Equipment } from '@/lib/types';
import { mockData } from '@/lib/mock-data';

interface ChangeEquipmentConditionDialogProps {
  equipment: Equipment;
  technicianId: string;
  onUpdate: (updatedEquipment: Equipment) => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Update Condition'}
        </Button>
    )
}

const conditions: Equipment['condition'][] = ['new', 'good', 'fair', 'poor', 'decommissioned'];

export function ChangeEquipmentConditionDialog({ equipment, technicianId, onUpdate }: ChangeEquipmentConditionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [state, formAction] = useActionState(updateEquipmentCondition, { success: false, message: '' });

    useEffect(() => {
        if (state?.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                const updatedItem = mockData.equipment.find(e => e.id === equipment.id);
                if (updatedItem) {
                    onUpdate(updatedItem as Equipment);
                }
                setIsOpen(false);
            }
        }
    }, [state, toast, equipment.id, onUpdate]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Change Condition
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Condition for {equipment.name}</DialogTitle>
                    <DialogDescription>Current condition: <span className="font-semibold">{equipment.condition}</span></DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="equipmentId" value={equipment.id} />
                    <input type="hidden" name="technicianId" value={technicianId} />
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newCondition">New Condition</Label>
                            <Select name="newCondition" defaultValue={equipment.condition}>
                                <SelectTrigger id="newCondition">
                                    <SelectValue placeholder="Select new condition" />
                                </SelectTrigger>
                                <SelectContent>
                                    {conditions.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Reason / Notes</Label>
                            <Textarea id="notes" name="notes" placeholder="e.g., Dropped from ladder, casing cracked." required />
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
