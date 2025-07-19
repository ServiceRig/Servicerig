
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import type { Invoice, Refund } from "@/lib/types";
import { RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { mockData } from '@/lib/mock-data';

interface IssueRefundDialogProps {
    invoice: Invoice;
    onRefundIssued: (newRefund: Refund) => void; 
}

export function IssueRefundDialog({ invoice, onRefundIssued }: IssueRefundDialogProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    
    const maxRefundableAmount = invoice.amountPaid || 0;
    
    const [amount, setAmount] = useState(maxRefundableAmount);
    const [method, setMethod] = useState<'original_payment' | 'credit_memo'>('original_payment');
    const [reason, setReason] = useState('');

    const handleIssueRefund = () => {
        if (amount <= 0 || amount > maxRefundableAmount + 0.001) { // Add tolerance for floating point issues
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: `Refund amount must be between $0.01 and ${maxRefundableAmount.toFixed(2)}.`,
            });
            return;
        }

        const newRefund: Refund = {
            id: `ref_${Math.random().toString(36).substring(2, 9)}`,
            invoiceId: invoice.id,
            amount,
            method,
            reason,
            date: new Date(),
            processedBy: 'user_admin_01'
        };
        
        // In a real app, you would call a server action here to save the refund
        // and update the invoice in Firestore. Here, we just update mock data.
        mockData.refunds.push(newRefund);
        console.log("Issuing new refund:", newRefund);

        toast({
            title: 'Refund Issued',
            description: `A refund of $${amount.toFixed(2)} has been recorded for invoice ${invoice.invoiceNumber}.`,
        });

        if (onRefundIssued) {
            onRefundIssued(newRefund);
        }
        
        // Reset form and close
        setIsOpen(false);
        setAmount(maxRefundableAmount - amount);
        setReason('');
        setMethod('original_payment');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={maxRefundableAmount <= 0}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Issue Refund / Credit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Issue Refund for Invoice {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription>
                        Max refundable amount: ${maxRefundableAmount.toFixed(2)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="method" className="text-right">Method</Label>
                         <RadioGroup value={method} onValueChange={(value: any) => setMethod(value)} className="col-span-3 flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="original_payment" id="r1" />
                                <Label htmlFor="r1">Refund</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="credit_memo" id="r2" />
                                <Label htmlFor="r2">Issue Credit</Label>
                            </div>
                        </RadioGroup>
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="reason" className="text-right mt-2">Reason</Label>
                        <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="col-span-3" placeholder="Optional reason for refund..."/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleIssueRefund}><RotateCcw className="mr-2 h-4 w-4" /> Issue Refund</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
