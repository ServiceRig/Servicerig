
'use client';

import { useState, useEffect, useMemo, Suspense, useActionState, ChangeEvent, use } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, Loader2, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { mockData } from '@/lib/mock-data';
import type { Customer, Job, LineItem, Invoice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateInvoice } from '@/app/actions';
import { useRole } from '@/hooks/use-role';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCustomerById } from '@/lib/firestore/customers';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending || disabled}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    );
}

function EditInvoicePageContent({ params }: { params: { invoiceId: string }}) {
    const { invoiceId } = params;
    const { toast } = useToast();
    const router = useRouter();
    const [updateInvoiceState, formAction] = useActionState(updateInvoice, { success: false, message: null, errors: null });
    const { role } = useRole();
    
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [invoiceTitle, setInvoiceTitle] = useState('');
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    
    const [taxRate, setTaxRate] = useState(0);

    useEffect(() => {
        const fetchInvoice = async () => {
            setIsLoading(true);
            const fetchedInvoice = mockData.invoices.find(inv => inv.id === invoiceId);

            if (!fetchedInvoice) {
                notFound();
                return;
            }

            if (fetchedInvoice.status !== 'draft') {
                toast({
                    variant: 'destructive',
                    title: 'Cannot Edit',
                    description: 'Only draft invoices can be edited. Redirecting...',
                });
                router.replace(`/dashboard/invoices/${invoiceId}?role=${role || 'admin'}`);
                return;
            }

            const fetchedCustomer = await getCustomerById(fetchedInvoice.customerId);

            if (fetchedCustomer) {
                setCustomer(fetchedCustomer);
                setTaxRate(mockData.taxZones.find(tz => tz.id === fetchedCustomer.taxRegion)?.rate || 0);
            }

            setInvoice(fetchedInvoice);
            setInvoiceTitle(fetchedInvoice.title);
            setLineItems(fetchedInvoice.lineItems);
            setIsLoading(false);
        };
        
        if (role) { // only fetch when role is determined
             fetchInvoice();
        }
    }, [invoiceId, toast, router, role]);
  
    useEffect(() => {
        if (updateInvoiceState?.message && !updateInvoiceState.success) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: updateInvoiceState.message,
            });
        }
    }, [updateInvoiceState, toast]);

    const handleAddLineItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, inventoryParts: [] }]);
    };

    const handleRemoveLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
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
        return invoiceTitle && lineItems.length > 0;
    }, [invoiceTitle, lineItems]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-4">Loading invoice for editing...</p>
            </div>
        );
    }

    if (!invoice || !customer) {
        return notFound();
    }

    return (
        <form action={formAction}>
            <div className="space-y-6">
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <input type="hidden" name="title" value={invoiceTitle} />
                <input type="hidden" name="lineItems" value={JSON.stringify(lineItems)} />
                <input type="hidden" name="role" value={role || ''} />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Edit Invoice</h1>
                        <p className="text-muted-foreground">Editing invoice {invoice.invoiceNumber}.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/dashboard/invoices/${invoice.id}?role=${role}`}>Cancel</Link>
                        </Button>
                        <SubmitButton disabled={!isFormSubmittable} />
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Customer & Jobs</CardTitle>
                                <CardDescription>This information cannot be changed after invoice creation.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p><strong>Customer:</strong> {customer.primaryContact.name}</p>
                                <p><strong>Jobs:</strong> {invoice.jobIds?.join(', ')}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Line Items</CardTitle>
                                <CardDescription>Edit the billable items for this invoice.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 mb-4">
                                    <Label htmlFor="title-input">Invoice Title</Label>
                                    <Input id="title-input" placeholder="e.g., HVAC Repair" value={invoiceTitle} onChange={e => setInvoiceTitle(e.target.value)} required />
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
                                                <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLineItem(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Button type="button" variant="link" onClick={handleAddLineItem} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Add Line Item</Button>
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
                                    <Label htmlFor="tax" className="text-muted-foreground">Tax Rate</Label>
                                    <p className="font-medium">{taxRate * 100}%</p>
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
            </div>
        </form>
    );
}

export default function EditInvoicePage({ params }: { params: Promise<{ invoiceId: string }> }) {
    const resolvedParams = use(params);
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditInvoicePageContent params={resolvedParams} />
        </Suspense>
    )
}
