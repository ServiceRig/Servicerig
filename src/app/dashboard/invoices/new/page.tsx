
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useActionState, useFormStatus } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, Loader2, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { mockData } from '@/lib/mock-data';
import type { Customer, Job, LineItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addInvoice } from '@/app/actions';
import { useRole } from '@/hooks/use-role';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button 
            type="submit" 
            disabled={pending || disabled} 
            form="invoice-form"
        >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Save as Draft'}
        </Button>
    )
}

function NewInvoicePageContent() {
    const { toast } = useToast();
    const [addInvoiceState, formAction] = useActionState(addInvoice, { success: false, message: null });
    const { role } = useRole();
    
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
    const [invoiceTitle, setInvoiceTitle] = useState('');
    
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    
    const [taxRate, setTaxRate] = useState(0);

    useEffect(() => {
        setCustomers(mockData.customers);
        setJobs(mockData.jobs);
    }, []);
  
    useEffect(() => {
        if (addInvoiceState?.message && !addInvoiceState.success) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: addInvoiceState.message,
            });
        }
    }, [addInvoiceState, toast]);

    const availableJobs = useMemo(() => {
        if (!selectedCustomerId) return [];
        return jobs.filter(job => job.customerId === selectedCustomerId && job.status === 'complete' && !job.invoiceId);
    }, [selectedCustomerId, jobs]);

    useEffect(() => {
        const selectedJobs = jobs.filter(job => selectedJobIds.has(job.id));
        if (selectedJobs.length > 0) {
            // A simple way to generate line items: use job titles
            const jobLineItems = selectedJobs.map(job => ({
                description: job.title,
                quantity: 1,
                unitPrice: job.duration * 1.5, // Placeholder price logic
                inventoryParts: [],
            }));
            setLineItems(jobLineItems);

            if (selectedJobs.length === 1) {
                setInvoiceTitle(selectedJobs[0].title);
            } else {
                const customerName = customers.find(c => c.id === selectedCustomerId)?.primaryContact.name || '';
                setInvoiceTitle(`Combined Invoice for ${customerName}`);
            }
        } else {
            setLineItems([]);
            setInvoiceTitle('');
        }
    }, [selectedJobIds, jobs, customers, selectedCustomerId]);

    const handleJobSelection = (jobId: string, checked: boolean) => {
        setSelectedJobIds(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(jobId);
            } else {
                newSet.delete(jobId);
            }
            return newSet;
        });
    }

    const handleAddLineItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, inventoryParts: [] }]);
    };

    const handleRemoveLineItem = (index: number) => {
        const newItems = lineItems.filter((_, i) => i !== index);
        setLineItems(newItems);
    };

    const handleLineItemChange = (index: number, field: keyof Omit<LineItem, 'inventoryParts' | 'origin'>, value: string | number) => {
        const newItems = [...lineItems];
        const item = newItems[index];

        if (field === 'quantity' || field === 'unitPrice') {
            const numericValue = typeof value === 'string' ? parseFloat(value) : value;
            item[field] = isNaN(numericValue) ? 0 : numericValue;
        } else {
            item[field] = value as string;
        }
        setLineItems(newItems);
    };
    
    const subtotal = useMemo(() => lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0), [lineItems]);
    const taxAmount = useMemo(() => subtotal * taxRate, [subtotal, taxRate]);
    const grandTotal = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

    const isFormSubmittable = useMemo(() => {
        return selectedCustomerId && invoiceTitle && selectedJobIds.size > 0;
    }, [selectedCustomerId, invoiceTitle, selectedJobIds]);

    return (
        <div className="space-y-6">
            <form id="invoice-form" action={formAction}>
                <input type="hidden" name="customerId" value={selectedCustomerId} />
                <input type="hidden" name="jobIds" value={JSON.stringify(Array.from(selectedJobIds))} />
                <input type="hidden" name="title" value={invoiceTitle} />
                <input type="hidden" name="lineItems" value={JSON.stringify(lineItems)} />
                <input type="hidden" name="role" value={role || ''} />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">New Invoice</h1>
                        <p className="text-muted-foreground">Create a new invoice from one or more completed jobs.</p>
                    </div>
                    <SubmitButton disabled={!isFormSubmittable} />
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer & Jobs</CardTitle>
                                <CardDescription>Select a customer to see their completed, uninvoiced jobs.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="customer">Customer</Label>
                                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                        <SelectTrigger id="customer">
                                            <SelectValue placeholder="Select a customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map(customer => (
                                                <SelectItem key={customer.id} value={customer.id}>{customer.primaryContact.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedCustomerId && (
                                    <div>
                                        <Label>Completed Jobs</Label>
                                        <ScrollArea className="h-48 mt-2 w-full rounded-md border">
                                            <div className="p-4">
                                                {availableJobs.length > 0 ? availableJobs.map(job => (
                                                    <div key={job.id} className="flex items-center space-x-2 mb-2">
                                                        <Checkbox id={`job-${job.id}`} onCheckedChange={(checked) => handleJobSelection(job.id, !!checked)} />
                                                        <label htmlFor={`job-${job.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            {job.title}
                                                        </label>
                                                    </div>
                                                )) : <p className="text-sm text-muted-foreground text-center">No completed jobs to invoice for this customer.</p>}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Line Items</CardTitle>
                                <CardDescription>These items will appear on the invoice. They are pre-filled from selected jobs.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 mb-4">
                                    <Label htmlFor="title">Invoice Title</Label>
                                    <Input id="title" placeholder="e.g., HVAC Repair" value={invoiceTitle} onChange={e => setInvoiceTitle(e.target.value)} required />
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60%]">Description</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lineItems.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell><Input value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} /></TableCell>
                                                <TableCell><Input type="number" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} className="text-center" /></TableCell>
                                                <TableCell><Input type="number" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} className="text-right" /></TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                                                <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveLineItem(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Button variant="link" onClick={handleAddLineItem} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Add Custom Line Item</Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                 <div className="flex justify-between items-center">
                                    <Label htmlFor="tax" className="text-muted-foreground">Tax Rate (%)</Label>
                                    <Input id="tax" type="number" value={taxRate * 100} onChange={e => setTaxRate(parseFloat(e.target.value) / 100 || 0)} className="w-24 h-8 text-right" />
                                </div>
                                <Separator />
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Grand Total</span>
                                    <span>{formatCurrency(grandTotal)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function NewInvoicePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewInvoicePageContent />
        </Suspense>
    )
}
