
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import type { Invoice, Payment } from "@/lib/types";
import { CreditCard, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { mockData } from '@/lib/mock-data';

interface AddPaymentDialogProps {
    invoice: Invoice;
    onPaymentAdded: (newPayment: Payment) => void; 
}

export function AddPaymentDialog({ invoice, onPaymentAdded }: AddPaymentDialogProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState(invoice.balanceDue);
    const [method, setMethod] = useState<'Credit Card' | 'Check' | 'Cash' | 'ACH' | 'Other'>('Credit Card');
    const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [transactionId, setTransactionId] = useState('');
    const [notes, setNotes] = useState('');

    const handleAddPayment = () => {
        if (amount <= 0 || amount > invoice.balanceDue + 0.001) { // Add tolerance for floating point issues
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: `Payment amount must be between $0.01 and ${invoice.balanceDue.toFixed(2)}.`,
            });
            return;
        }

        const newPayment: Payment = {
            id: `pay_${Math.random().toString(36).substring(2, 9)}`,
            invoiceId: invoice.id,
            customerId: invoice.customerId,
            amount,
            method,
            date: new Date(paymentDate),
            transactionId,
            notes,
            recordedBy: 'user_admin_01'
        };

        // In a real app, you would call a server action here to save the payment
        // and update the invoice in Firestore. Here, we just update mock data.
        mockData.payments.push(newPayment);
        console.log("Adding new payment:", newPayment);


        toast({
            title: 'Payment Recorded',
            description: `A payment of $${amount.toFixed(2)} has been recorded for invoice ${invoice.invoiceNumber}.`,
        });

        if (onPaymentAdded) {
            onPaymentAdded(newPayment);
        }
        
        // Reset form and close
        setAmount(invoice.balanceDue - amount);
        setMethod('Credit Card');
        setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
        setTransactionId('');
        setNotes('');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button disabled={invoice.balanceDue <= 0}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Payment for Invoice {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription>
                        The remaining balance is ${invoice.balanceDue.toFixed(2)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paymentDate" className="text-right">Date</Label>
                        <Input id="paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="method" className="text-right">Method</Label>
                        <Select value={method} onValueChange={(value) => setMethod(value as any)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Credit Card">Credit Card</SelectItem>
                                <SelectItem value="Check">Check</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="ACH">ACH</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="transactionId" className="text-right">Transaction ID</Label>
                        <Input id="transactionId" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="col-span-3" placeholder="Optional" />
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="notes" className="text-right mt-2">Notes</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" placeholder="Optional notes..."/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleAddPayment}><CreditCard className="mr-2 h-4 w-4" /> Save Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
