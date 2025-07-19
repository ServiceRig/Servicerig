
'use client';

import React, { useState, useEffect, Suspense, use } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { format } from 'date-fns';
import { User, Calendar, Tag, FileText, FileSignature, FileDiff, Printer, CreditCard, Send, Edit, Copy, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { cn, getInvoiceStatusStyles } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { mockData } from '@/lib/mock-data';
import type { Invoice, Customer, Job } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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

const getInvoiceData = async (invoiceId: string): Promise<Invoice | null> => {
    let invoice = mockData.invoices.find(inv => inv.id === invoiceId) || null;
    if (invoice) {
        invoice.customer = mockData.customers.find(c => c.id === invoice.customerId);
        invoice.job = mockData.jobs.find(j => j.id === invoice.jobId);
    }
    return invoice;
}

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

function InvoiceDetailsPageContent({ invoiceId }: { invoiceId: string }) {
  const { role } = useRole();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        const data = await getInvoiceData(invoiceId);
        setInvoice(data);
    };
    fetchData();
  }, [invoiceId]);

  if (!invoice) {
    // In a real app, you might show a loading skeleton here
    return <div>Loading...</div>;
  }
  
  if (!invoice.customer) {
      return <div>Customer data not found for this invoice.</div>
  }

  return (
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

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">{invoice.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">{invoice.invoiceNumber}</p>
            <Badge className={cn("capitalize", getInvoiceStatusStyles(invoice.status))}>
              {invoice.status}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            <Button variant="outline"><Copy className="mr-2 h-4 w-4" /> Duplicate</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print / PDF</Button>
            <Button><Send className="mr-2 h-4 w-4" /> Send Invoice</Button>
             {invoice.status !== 'paid' && (
                <Button variant="secondary"><CreditCard className="mr-2 h-4 w-4" /> Mark as Paid</Button>
            )}
        </div>
      </div>
      
      <Separator className="print:hidden" />

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
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-2 text-sm w-full ml-auto max-w-xs">
                        <div className="font-medium text-muted-foreground">Subtotal:</div>
                        <div className="text-right">{formatCurrency(invoice.subtotal)}</div>
                        <div className="font-medium text-muted-foreground">Tax:</div>
                        <div className="text-right">{formatCurrency(invoice.tax)}</div>
                        <div className="font-bold text-base text-right col-span-2 border-t pt-2 mt-1">
                           {formatCurrency(invoice.total)}
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card className="print:shadow-none print:border-none">
                <CardHeader className="print:p-0">
                    <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="print:p-0">
                    <p className="text-sm text-muted-foreground">{invoice.notes || 'No notes for this invoice.'}</p>
                     <p className="text-sm mt-2"><strong>Payment Terms:</strong> {invoice.paymentTerms || 'N/A'}</p>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6 print:hidden">
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
                    <Link href={`/dashboard/customers/${invoice.customer.id}?role=${role}`} className="text-primary hover:underline">{invoice.customer.primaryContact.name}</Link>
                </InfoCard>
            </CardContent>
          </Card>

          <QuickBooksSyncCard syncStatus={invoice.quickbooksSync} />

           <Card>
            <CardHeader>
                <CardTitle>Linked Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {invoice.job && (
                     <InfoCard icon={Tag} label="Job">
                        <Link href={`/dashboard/jobs/${invoice.job.id}?role=${role}`} className="text-primary hover:underline">{invoice.job.title}</Link>
                    </InfoCard>
                )}
                {invoice.linkedEstimateIds && invoice.linkedEstimateIds.map(estId => (
                     <InfoCard key={estId} icon={FileText} label="Estimate">
                        <Link href={`/dashboard/estimates/${estId}?role=${role}`} className="text-primary hover:underline">{estId}</Link>
                    </InfoCard>
                ))}
                {invoice.linkedChangeOrderIds && invoice.linkedChangeOrderIds.map(coId => (
                     <InfoCard icon={FileDiff} label="Change Order">
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
  );
}


export default function InvoiceDetailsPage({ params }: { params: { invoiceId: string } }) {
    return (
        <TooltipProvider>
            <Suspense fallback={<div>Loading invoice details...</div>}>
                <InvoiceDetailsPageContent invoiceId={params.invoiceId} />
            </Suspense>
        </TooltipProvider>
    )
}
