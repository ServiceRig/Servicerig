
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { mockData } from '@/lib/mock-data';
import type { Invoice, Customer, TaxLine } from '@/lib/types';
import { cn, getInvoiceStatusStyles } from '@/lib/utils';
import { CreditCard, Download, AlertTriangle } from 'lucide-react';
import { verifyInvoiceToken } from '@/lib/auth/tokens';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// In a real app, this would be a single Firestore query
const getInvoicePublicData = async (invoiceId: string): Promise<{ invoice: Invoice, customer: Customer } | null> => {
    const invoice = mockData.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return null;

    const customer = mockData.customers.find(c => c.id === invoice.customerId);
    if (!customer) return null;

    // We only want to return a subset of data for security
    return {
        invoice: {
            ...invoice,
            internalNotes: undefined, // Redact internal data
            quickbooksSync: undefined,
            xeroSync: undefined,
            commission: undefined,
        },
        customer
    };
};

async function CustomerInvoiceView({ invoiceId, token }: { invoiceId: string, token: string }) {
    
    const isValidToken = await verifyInvoiceToken(token, invoiceId);

    if (!isValidToken) {
        return (
             <Card className="max-w-lg mx-auto mt-16">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Invalid Link</CardTitle>
                    <CardDescription>
                        The link you used is either invalid or has expired. Please request a new link from the sender.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const data = await getInvoicePublicData(invoiceId);

    if (!data) {
        notFound();
    }

    const { invoice, customer } = data;
    const address = customer.companyInfo.address;
    const fullAddress = address ? `${address.street}, ${address.city}, ${address.state} ${address.zipCode}` : 'No address provided';

    return (
        <div className="max-w-4xl mx-auto my-8 p-4 sm:p-8 bg-card text-card-foreground rounded-xl shadow-lg border">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-4">
                        <Logo className="h-16 w-16" />
                        <div>
                            <h1 className="text-2xl font-bold">ServiceRig</h1>
                            <p className="text-muted-foreground text-sm">123 Fire Street, Suite 101<br/>Inferno, CA 91234</p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-muted-foreground">INVOICE</h2>
                    <p className="font-mono text-sm">{invoice.invoiceNumber}</p>
                    <div className="mt-2">
                        <Badge className={cn("capitalize", getInvoiceStatusStyles(invoice.status))}>
                            {invoice.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Customer and Dates */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 text-sm">
                <div className="md:col-span-1">
                    <p className="font-semibold text-muted-foreground mb-1">Bill To</p>
                    <p className="font-bold">{customer.primaryContact.name}</p>
                    <p>{fullAddress}</p>
                    <p>{customer.primaryContact.email}</p>
                </div>
                 <div className="md:col-span-2 grid grid-cols-2 gap-4">
                     <div>
                        <p className="font-semibold text-muted-foreground">Issue Date</p>
                        <p>{format(new Date(invoice.issueDate), 'MMMM d, yyyy')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-muted-foreground">Due Date</p>
                        <p>{format(new Date(invoice.dueDate), 'MMMM d, yyyy')}</p>
                    </div>
                </div>
            </div>
            
             <Separator className="my-6" />

             {/* Line Items Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoice.lineItems.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Totals Section */}
            <div className="flex justify-end mt-6">
                 <div className="w-full max-w-sm space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {(invoice.taxes || []).map((tax: TaxLine, index: number) => (
                        <div key={index} className="flex justify-between">
                            <span className="text-muted-foreground">{tax.name} ({tax.rate ? (tax.rate*100).toFixed(2) : ''}%):</span>
                            <span>{formatCurrency(tax.amount)}</span>
                        </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(invoice.total)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                        <span>Amount Paid:</span>
                        <span>-{formatCurrency(invoice.amountPaid)}</span>
                    </div>
                     <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(invoice.balanceDue)}</span>
                    </div>
                </div>
            </div>

            <Separator className="my-8" />
            
             {/* Payment & Actions */}
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="text-sm text-muted-foreground max-w-md">
                    <p className="font-semibold">Thank you for your business!</p>
                    <p>Payment Terms: {invoice.paymentTerms || 'Net 30'}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    <Button className="flex-grow sm:flex-grow-0" disabled={invoice.balanceDue <= 0}>
                        <CreditCard className="mr-2 h-4 w-4"/> Pay with Stripe
                    </Button>
                </div>
             </div>
             <div className="text-center mt-8">
                <Button variant="link" size="sm" className="text-muted-foreground">
                    <AlertTriangle className="mr-2 h-4 w-4" /> Having an issue? Dispute this invoice.
                </Button>
            </div>
        </div>
    );
}

export default function CustomerInvoicePortalPage({ params, searchParams }: { params: { invoiceId: string }, searchParams: { token?: string }}) {
    const { invoiceId } = params;
    const { token } = searchParams;
    
    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                 <Card className="max-w-lg mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Access Denied</CardTitle>
                        <CardDescription>
                            No access token provided. Please use the link from your email to view this invoice.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="bg-muted min-h-screen">
            <Suspense fallback={<div className="text-center p-8">Loading invoice...</div>}>
                <CustomerInvoiceView invoiceId={invoiceId} token={token} />
            </Suspense>
        </div>
    )
}
