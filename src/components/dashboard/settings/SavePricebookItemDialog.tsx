
'use client';

import { useState, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from 'lucide-react';
import { addPricebookItemAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { GeneratePriceOutput } from '@/ai/flows/generate-price';
import type { PricebookItem } from '@/lib/types';

interface SavePricebookItemDialogProps {
  itemData: GeneratePriceOutput;
  onItemAdded: (newItem: PricebookItem) => void;
  children: React.ReactNode;
}

const trades: PricebookItem['trade'][] = ['Plumbing', 'HVAC', 'Electrical', 'General'];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Save Item'}
        </Button>
    )
}

export function SavePricebookItemDialog({ itemData, onItemAdded, children }: SavePricebookItemDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [state, formAction] = useActionState(addPricebookItemAction, { success: false, message: '', item: undefined });

    useEffect(() => {
        if (!isOpen) return; // Only show toasts if the dialog was open

        if (state.success && state.item) {
            toast({
                title: 'Item Saved',
                description: `"${state.item.title}" was added to the price book.`,
            });
            onItemAdded(state.item);
            setIsOpen(false);
        } else if (state.message && !state.success) {
            toast({
                variant: 'destructive',
                title: 'Error Saving Item',
                description: state.message,
            });
        }
    }, [state, onItemAdded, toast, isOpen]);


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                 <form action={formAction}>
                    <input type="hidden" name="title" value={itemData.recommendedTitle} />
                    <input type="hidden" name="description" value={itemData.serviceDescription} />
                    <input type="hidden" name="price" value={String(itemData.suggestedPrice)} />
                    
                    <DialogHeader>
                        <DialogTitle>Save to Price Book</DialogTitle>
                        <DialogDescription>
                            Please select a trade to categorize this new item correctly.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="trade">Trade</Label>
                        <Select name="trade" defaultValue="General" required>
                            <SelectTrigger id="trade">
                                <SelectValue placeholder="Select a trade" />
                            </SelectTrigger>
                            <SelectContent>
                                {trades.map(trade => (
                                    <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         {state.message && !state.success && <p className="text-sm font-medium text-destructive mt-2">{state.message}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                 </form>
            </DialogContent>
        </Dialog>
    );
}
