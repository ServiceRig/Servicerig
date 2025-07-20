

'use client';

import React, { useState, useEffect, Suspense, use } from 'react';
import { useFormStatus } from 'react-dom';
import { notFound, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { format, isPast } from 'date-fns';
import { User, Calendar, Tag, FileText, FileSignature, FileDiff, Printer, CreditCard, Send, Edit, Copy, RefreshCw, AlertCircle, CheckCircle, RotateCcw, ThumbsUp, MessageSquare, Clock, Wand2, Loader2, ListChecks, ShieldAlert, History } from 'lucide-react';
import { cn, getInvoiceStatusStyles } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { mockData } from '@/lib/mock-data';
import type { Invoice, Customer, Job, Payment, Refund, TaxLine, Estimate, AuditLogEntry } from '@/lib/types';
import { useRole, UserRole } from '@/hooks/use-role';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AddPaymentDialog } from '@/components/dashboard/invoices/AddPaymentDialog';
import { IssueRefundDialog } from '@/components/dashboard/invoices/IssueRefundDialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useActionState } from 'react';
import { analyzeInvoiceAction } from '@/app/actions';
import { Switch } from '@/components/ui/switch';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoiceAuditLog } from '@/components/dashboard/invoices/InvoiceAuditLog';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const InfoCard = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 print:bg-transparent print:p-0 print:gap-2">
        <Icon className="h-5 w-5 text-muted-foreground mt-1 print:h-4 print:w-4" />
        <div className="flex-grow">
            <p className="text-sm text-muted-foreground print:text-xs">{label}</p>
            <div className="font-medium text-sm print:text-base">{children}</div>
        </div>
    </div>
);

// This function simulates fetching an invoice and enriching it with related data
const getInvoiceData = async (invoiceId: string): Promise<(Invoice & {jobs: Job[]}) | null> => {
    // In a real app, this would be a Firestore query.
    // We are finding the invoice in our mock data.
    const invoice = mockData.invoices.find(inv => inv.id === invoiceId) || null;
    if (!invoice) return null;

    // Enrich with customer and job data
    const customer = mockData.customers.find(c => c.id === invoice.customerId);
    const jobs = (invoice.jobIds || []).map(jobId => mockData.jobs.find(j => j.id === jobId)).filter(Boolean) as Job[];
    
    // Enrich with payments and refunds
    const payments = mockData.payments.filter(p => p.invoiceId === invoiceId);
    const refunds = mockData.refunds.filter(r => r.invoiceId === invoiceId);

    // This simulates what would happen on a server or in a data-fetching layer
    // In our mock setup, we have to calculate these on the fly.
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const amountRefunded = refunds.reduce((sum, r) => sum + r.amount, 0);
    const netPaid = amountPaid - amountRefunded;
    const totalTax = (invoice.taxes || []).reduce((sum, tax) => sum + tax.amount, 0);
    const total = invoice.subtotal + totalTax;
    const balanceDue = total - netPaid;
    
    let status = invoice.status;
    if (status !== 'draft' && status !== 'refunded' && status !== 'credited' && status !== 'pending_review') {
      if (balanceDue <= 0 && netPaid > 0) {
        status = 'paid';
      } else if (netPaid > 0) {
        status = 'partially_paid';
      } else if (new Date() > new Date(invoice.dueDate)) {
        status = 'overdue';
      }
    }

    return {
        ...invoice,
        customer,
        jobs,
        payments,
        refunds,
        amountPaid: netPaid,
        balanceDue,
        total,
        status: invoice.status === 'refunded' ? 'refunded' : status // Preserve original refunded status
    };
};

function QuickBooksSyncCard({ syncStatus }: { syncStatus: Invoice['quickbooksSync']}) {
  const statusConfig = {
    synced: {
      icon: CheckCircle,
      color: 'text-green-600',
      label: 'Synced with QuickBooks',
      description: `Last sync: ${syncStatus?.lastSync ? format(new Date(syncStatus.lastSync), 'PPpp') : 'N/A'}`,
    },
    pending: {
      icon: RefreshCw,
      color: 'text-yellow-600 animate-spin',
      label: 'Sync Pending',
      description: 'Waiting to sync with QuickBooks.',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      label: 'Sync Error',
      description: syncStatus?.error || 'An unknown error occurred.',
    },
  };

  const config = syncStatus ? statusConfig[syncStatus.status] : statusConfig.pending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>QuickBooks Sync</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <config.icon className={cn("h-6 w-6", config.color)} />
          <div>
            <p className="font-semibold">{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Now
        </Button>
      </CardContent>
    </Card>
  );
}

function InvoiceActionsCard({ invoice, onInvoiceUpdate }: { invoice: Invoice, onInvoiceUpdate: (invoice: Invoice) => void }) {
    const [internalNote, setInternalNote] = useState(invoice.internalNotes || '');
    const [lateFeesEnabled, setLateFeesEnabled] = useState(invoice.lateFeePolicy?.enabled ?? true);

    const handleApprove = () => {
        // In a real app, this would be a server action
        const updatedInvoice = { ...invoice, status: 'draft', internalNotes: internalNote };
        onInvoiceUpdate(updatedInvoice);
        // show toast
    }

    const handleLateFeeToggle = (enabled: boolean) => {
        setLateFeesEnabled(enabled);
        const updatedInvoice = { 
            ...invoice, 
            lateFeePolicy: { ...(invoice.lateFeePolicy || {}), enabled }
        };
        onInvoiceUpdate(updatedInvoice as Invoice);
        // show toast
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoice Actions</CardTitle>
                <CardDescription>Internal actions for this invoice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {invoice.status === 'pending_review' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <h4 className="font-semibold text-yellow-800">Pending Approval</h4>
                        </div>
                        <p className="text-sm text-yellow-700">This invoice was submitted by a technician and needs to be reviewed.</p>
                        <div className="flex gap-2">
                             <Button size="sm" onClick={handleApprove}><ThumbsUp className="mr-2 h-4 w-4" /> Approve</Button>
                             <Button size="sm" variant="outline"><MessageSquare className="mr-2 h-4 w-4" /> Request Changes</Button>
                        </div>
                    </div>
                )}
                <div>
                    <Label htmlFor="internalNotes">Internal Notes</Label>
                    <Textarea
                        id="internalNotes"
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="Add notes for your team..."
                        className="mt-1"
                    />
                </div>
                 <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className='space-y-0.5'>
                        <Label htmlFor="late-fees" className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            <span>Late Fees</span>
                        </Label>
                         <p className="text-xs text-muted-foreground">Automatically apply late fees if invoice becomes overdue.</p>
                    </div>
                    <Switch
                        id="late-fees"
                        checked={lateFeesEnabled}
                        onCheckedChange={handleLateFeeToggle}
                    />
                </div>
                {(invoice as any).jobs && (invoice as any).jobs.length > 0 && (
                    <div>
                        <Label>Timeclock Summary</Label>
                        <div className="text-sm p-3 bg-muted rounded-md mt-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground"/>
                                <span>Total Job Time:</span>
                            </div>
                            <span className="font-semibold">{((invoice as any).jobs.reduce((acc: number, j: Job) => acc + j.duration, 0) / 60).toFixed(2)} hours</span>
                        </div>
                    </div>
                )}
            </CardContent>
             <CardFooter>
                <Button className="w-full" variant="ghost">Save Notes</Button>
            </CardFooter>
        </Card>
    );
}

function PaymentPlanCard({ invoice }: { invoice: Invoice }) {
    if (!invoice.paymentPlan) return null;

    const { schedule, totalAmount } = invoice.paymentPlan;
    const amountPaid = schedule.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const progress = totalAmount > 0 ? (amountPaid / totalAmount) * 100 : 0;
    const now = new Date();

    const getStatusBadge = (status: 'pending' | 'paid' | 'overdue', dueDate: Date) => {
        if (status === 'paid') return <Badge variant="default" className="bg-green-500">Paid</Badge>;
        if (status === 'overdue' || (status === 'pending' && isPast(dueDate))) return <Badge variant="destructive">Overdue</Badge>;
        return <Badge variant="secondary">Due Soon</Badge>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Plan</CardTitle>
                <CardDescription>This invoice is being paid in installments.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>{formatCurrency(amountPaid)} paid of {formatCurrency(totalAmount)}</span>
                            <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedule.map((installment, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{formatCurrency(installment.amount)}</TableCell>
                                    <TableCell>{format(new Date(installment.dueDate), 'PP')}</TableCell>
                                    <TableCell>{getStatusBadge(installment.status, new Date(installment.dueDate))}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

// Internal component to use useFormStatus hook correctly
function AnalyzeButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Analyze Invoice
        </Button>
    )
}

function AiAnalyzerCard({ invoice, job, estimates }: { invoice: Invoice, job?: Job, estimates?: Estimate[] }) {
    const [state, formAction] = useActionState(analyzeInvoiceAction, { data: null, error: null });
    
    const jobDetails = job ? `Job Title: ${job.title}\nDescription: ${job.description}` : "N/A";
    const estimateDetails = estimates && estimates.length > 0 ? estimates.map(e => `Estimate #${e.estimateNumber}: ${e.title}\nItems:\n${e.lineItems.map(li => `- ${li.description}: ${formatCurrency(li.unitPrice)}`).join('\n')}\nTotal: ${formatCurrency(e.total)}`).join('\n\n') : "N/A";
    const invoiceDetails = `Invoice #${invoice.invoiceNumber}: ${invoice.title}\nItems:\n${invoice.lineItems.map(li => `- ${li.description}: ${formatCurrency(li.unitPrice)}`).join('\n')}\nTotal: ${formatCurrency(invoice.total)}`;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Invoice Analyzer</CardTitle>
                <CardDescription>Check for inconsistencies before sending.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction}>
                    <input type="hidden" name="jobDetails" value={jobDetails} />
                    <input type="hidden" name="estimateDetails" value={estimateDetails} />
                    <input type="hidden" name="invoiceDetails" value={invoiceDetails} />
                    <AnalyzeButton />
                </form>
                {state.error && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert>}
                {state.data && (
                    <div className="mt-4 space-y-3">
                         <Alert variant={state.data.isConsistent ? 'default' : 'destructive'}>
                             <AlertTitle className="flex items-center gap-2">
                                {state.data.isConsistent ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                                Analysis Summary
                            </AlertTitle>
                            <AlertDescription>{state.data.analysisSummary}</AlertDescription>
                        </Alert>
                        {state.data.anomalies.length > 0 && (
                             <Card className="bg-muted/50">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base">Potential Issues</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <ul className="space-y-2 text-sm list-disc pl-5">
                                        {state.data.anomalies.map((anomaly: any, index: number) => (
                                            <li key={index}>{anomaly.description}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function InvoiceDetailsPageContent({ invoiceId }: { invoiceId: string }) {
  const { role } = useRole();
  const searchParams = useSearchParams();
  const newInvoiceDataParam = searchParams.get('newInvoiceData');

  const [invoice, setInvoice] = useState<(Invoice & {jobs: Job[]}) | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        let fetchedInvoice = await getInvoiceData(invoiceId);
        
        // Optimistic UI fallback
        if (!fetchedInvoice && newInvoiceDataParam) {
            console.log("Invoice not found in DB, using fallback from URL params.");
            try {
                const parsedData = JSON.parse(decodeURIComponent(newInvoiceDataParam));
                 // Enrich with customer and job data since it won't be in the param
                if (parsedData) {
                  const customer = mockData.customers.find(c => c.id === parsedData.customerId);
                  const jobs = (parsedData.jobIds || []).map((jobId: string) => mockData.jobs.find(j => j.id === jobId)).filter(Boolean) as Job[];
                  fetchedInvoice = { ...parsedData, customer: customer as Customer, jobs, payments: [], refunds: [] };
                }
            } catch(e) {
                console.error("Failed to parse invoice data from URL", e);
            }
        }
        
        if (!fetchedInvoice) {
            setError(`Invoice with ID "${invoiceId}" not found.`);
            setIsLoading(false);
            return;
        }

        setInvoice(fetchedInvoice as Invoice & { jobs: Job[] });

        if (fetchedInvoice.linkedEstimateIds) {
            const fetchedEstimates = await Promise.all(
              fetchedInvoice.linkedEstimateIds.map(id => mockData.estimates.find(e => e.id === id)).filter(Boolean) as Estimate[]
            );
            setEstimates(fetchedEstimates);
        }

    } catch (e: any) {
        console.error("Failed to fetch invoice data:", e);
        setError("An unexpected error occurred while fetching invoice details.");
    } finally {
        setIsLoading(false);
    }
  }, [invoiceId, newInvoiceDataParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDataChange = () => {
      // Re-fetch all data to update the invoice details after a change
      fetchData();
  };
  
    const handlePrint = () => {
        const input = document.getElementById('printable-area');
        if (input) {
            html2canvas(input, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = 10;
                pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                pdf.save(`invoice-${invoice?.invoiceNumber}.pdf`);
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full p-4">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle>Error Loading Invoice</CardTitle>
                        <CardDescription>We couldn't find the invoice you were looking for.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
                        <p className="text-sm text-muted-foreground">This can sometimes happen in the development environment due to fast page reloads. The invoice may have been created successfully.</p>
                         <Button asChild className="mt-4 w-full">
                              <Link href="/dashboard/invoices">Go back to Invoices</Link>
                          </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

  if (!invoice || !invoice.customer) {
    return notFound();
  }
  
  const isInternalUser = role === UserRole.Admin || role === UserRole.Dispatcher;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden mb-6">
        <div>
          <h1 className="text-3xl font-bold">{invoice.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">{invoice.invoiceNumber}</p>
            <Badge className={cn("capitalize", getInvoiceStatusStyles(invoice.status))}>
              {invoice.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" disabled={invoice.status !== 'draft'}>
                <Link href={`/dashboard/invoices/${invoice.id}/edit?role=${role}`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
            </Button>
            <Button variant="outline"><Copy className="mr-2 h-4 w-4" /> Duplicate</Button>
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print / PDF</Button>
            <Button><Send className="mr-2 h-4 w-4" /> Send Invoice</Button>
        </div>
      </div>
      <div className="space-y-6" id="printable-area">
        <div className="hidden print:block">
              <div className="flex justify-between items-start mb-8">
                  <div>
                      <div className="flex items-center gap-4">
                          <Logo className="h-20 w-20" />
                          <div>
                              <h1 className="text-3xl font-bold">ServiceRig</h1>
                              <p className="text-muted-foreground">123 Fire Street, Suite 101<br/>Inferno, CA 91234</p>
                              <p className="text-muted-foreground">contact@servicerig.com | (555) 123-4567</p>
                          </div>
                      </div>
                  </div>
                  <div className="text-right">
                      <h2 className="text-4xl font-bold text-muted-foreground">INVOICE</h2>
                      <p className="font-mono">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground mt-2">Date Issued: {format(new Date(invoice.issueDate), 'MMMM d, yyyy')}</p>
                       <p className="text-sm text-muted-foreground">Due Date: {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}</p>
                  </div>
              </div>
              <Separator className="my-8" />
               <div className="grid grid-cols-2 gap-8">
                  <div>
                      <h3 className="font-semibold mb-2">Bill To:</h3>
                      <p className="font-bold">{invoice.customer.primaryContact.name}</p>
                      <p>{invoice.customer.companyInfo.address}</p>
                      <p>{invoice.customer.primaryContact.email}</p>
                  </div>
              </div>
               <Separator className="my-8" />
          </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p></CardContent>
              </Card>
              <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Net Paid</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{formatCurrency(invoice.amountPaid)}</p></CardContent>
              </Card>
              <Card className={invoice.balanceDue > 0 ? "border-destructive" : "border-green-500"}>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Balance Due</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{formatCurrency(invoice.balanceDue)}</p></CardContent>
              </Card>
          </div>


        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
              <Card className="print:shadow-none print:border-none">
                  <CardHeader className="print:hidden">
                      <CardTitle>Line Items</CardTitle>
                  </CardHeader>
                  <CardContent className="print:p-0">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead className="w-12"></TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="text-center">Qty</TableHead>
                                  <TableHead className="text-right">Unit Price</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {invoice.lineItems.map((item, index) => (
                                  <TableRow key={index}>
                                      <TableCell>
                                        {item.origin && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                  <p>From {item.origin.type}: {item.origin.id}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                      </TableCell>
                                      <TableCell className="font-medium">{item.description}</TableCell>
                                      <TableCell className="text-center">{item.quantity}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-2 gap-2 text-sm w-full ml-auto max-w-xs">
                          <div className="font-medium text-muted-foreground">Subtotal:</div>
                          <div className="text-right">{formatCurrency(invoice.subtotal)}</div>
                          {(invoice.taxes || []).map((tax, index) => (
                            <div key={index} className="contents">
                              <div className="font-medium text-muted-foreground">{tax.name}:</div>
                              <div className="text-right">{formatCurrency(tax.amount)}</div>
                            </div>
                          ))}
                          <div className="font-bold text-base text-right col-span-2 border-t pt-2 mt-1">
                             {formatCurrency(invoice.total)}
                          </div>
                      </div>
                  </CardContent>
              </Card>
              
              {invoice.paymentPlan && <PaymentPlanCard invoice={invoice} />}


               <Card className="print:shadow-none print:border-none">
                  <CardHeader>
                      <CardTitle>Payments</CardTitle>
                  </CardHeader>
                   <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Method</TableHead>
                                  <TableHead>Transaction ID</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {invoice.payments && invoice.payments.length > 0 ? (
                                  invoice.payments.map((payment) => (
                                      <TableRow key={payment.id}>
                                          <TableCell>{format(new Date(payment.date), 'PP')}</TableCell>
                                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                          <TableCell>{payment.method}</TableCell>
                                          <TableCell>{payment.transactionId || 'N/A'}</TableCell>
                                      </TableRow>
                                  ))
                              ) : (
                                  <TableRow>
                                      <TableCell colSpan={4} className="text-center h-24">No payments recorded</TableCell>
                                  </TableRow>
                              )}
                          </TableBody>
                      </Table>
                      <div className="mt-4 flex items-center gap-2">
                          <AddPaymentDialog invoice={invoice} onPaymentAdded={handleDataChange} />
                           <Button
                              variant="outline"
                              disabled={invoice.balanceDue <= 0}
                              onClick={() => alert('Redirecting to Stripe...')}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Pay with Stripe
                          </Button>
                      </div>
                  </CardContent>
              </Card>

              <Card className="print:shadow-none print:border-none">
                  <CardHeader>
                      <CardTitle>Refunds & Credits</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Method</TableHead>
                                  <TableHead>Reason</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {invoice.refunds && invoice.refunds.length > 0 ? (
                                  invoice.refunds.map((refund) => (
                                      <TableRow key={refund.id}>
                                          <TableCell>{format(new Date(refund.date), 'PP')}</TableCell>
                                          <TableCell>{formatCurrency(refund.amount)}</TableCell>
                                          <TableCell className="capitalize">{refund.method.replace('_', ' ')}</TableCell>
                                          <TableCell>{refund.reason || 'N/A'}</TableCell>
                                      </TableRow>
                                  ))
                              ) : (
                                  <TableRow>
                                      <TableCell colSpan={4} className="text-center h-24">No refunds or credits issued</TableCell>
                                  </TableRow>
                              )}
                          </TableBody>
                      </Table>
                      <div className="mt-4">
                          <IssueRefundDialog invoice={invoice} onRefundIssued={handleDataChange} />
                      </div>
                  </CardContent>
              </Card>

               <Card className="print:shadow-none print:border-none">
                  <CardHeader className="print:p-0">
                      <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="print:p-0 pt-4">
                      <p className="text-sm text-muted-foreground">{invoice.notes || 'No notes for this invoice.'}</p>
                       <p className="text-sm mt-2"><strong>Payment Terms:</strong> {invoice.paymentTerms || 'N/A'}</p>
                  </CardContent>
              </Card>
          </div>

          <div className="space-y-6 print:hidden">
            {isInternalUser && <InvoiceActionsCard invoice={invoice} onInvoiceUpdate={setInvoice as (invoice: Invoice) => void} />}
            {isInternalUser && <AiAnalyzerCard invoice={invoice} job={(invoice as any).jobs?.[0]} estimates={estimates} />}
            <Card>
              <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                  <InfoCard icon={Calendar} label="Created Date">
                      {format(new Date(invoice.createdAt), 'MMMM d, yyyy')}
                  </InfoCard>
                   <InfoCard icon={Calendar} label="Due Date">
                      {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}
                  </InfoCard>
                   <InfoCard icon={User} label="Customer">
                      <Link href={`/dashboard/customers/${(invoice.customer as Customer).id}?role=${role}`} className="text-primary hover:underline">{(invoice.customer as Customer).primaryContact.name}</Link>
                  </InfoCard>
              </CardContent>
            </Card>
            
            {isInternalUser && invoice.auditLog && <InvoiceAuditLog logs={invoice.auditLog} />}

            {isInternalUser && <QuickBooksSyncCard syncStatus={invoice.quickbooksSync} />}

             <Card>
              <CardHeader>
                  <CardTitle>Linked Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                  {invoice.jobs && invoice.jobs.map(job => (
                       <InfoCard key={job.id} icon={Tag} label="Job">
                          <Link href={`/dashboard/jobs/${job.id}?role=${role}`} className="text-primary hover:underline">{job.title}</Link>
                      </InfoCard>
                  ))}
                  {invoice.linkedEstimateIds && invoice.linkedEstimateIds.map(estId => (
                       <InfoCard key={estId} icon={FileText} label="Estimate">
                          <Link href={`/dashboard/estimates/${estId}?role=${role}`} className="text-primary hover:underline">{estId}</Link>
                      </InfoCard>
                  ))}
                  {invoice.linkedChangeOrderIds && invoice.linkedChangeOrderIds.map(coId => (
                       <InfoCard key={coId} icon={FileDiff} label="Change Order">
                          <Link href={`/dashboard/change-orders/${coId}?role=${role}`} className="text-primary hover:underline">{coId}</Link>
                      </InfoCard>
                  ))}
                   {invoice.linkedServiceAgreementId && (
                       <InfoCard icon={FileSignature} label="Service Agreement">
                          <Link href={`/dashboard/service-agreements/${invoice.linkedServiceAgreementId}?role=${role}`} className="text-primary hover:underline">{invoice.linkedServiceAgreementId}</Link>
                      </InfoCard>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}


export default function InvoiceDetailsPage({ params }: { params: { invoiceId: string } }) {
    const resolvedParams = use(params);
    return (
        <TooltipProvider>
            <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                <InvoiceDetailsPageContent invoiceId={resolvedParams.invoiceId} />
            </Suspense>
        </TooltipProvider>
    )
}

