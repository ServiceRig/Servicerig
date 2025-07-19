
'use client';

import { useState, useEffect, Suspense } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { format } from 'date-fns';
import { User, Calendar, Tag, Signature, Check, Loader2 } from 'lucide-react';
import { cn, getEstimateStatusStyles } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EstimateActions } from './EstimateActions';
import { Logo } from '@/components/logo';
import { getCustomerById } from '@/lib/firestore/customers';
import { getJobById } from '@/lib/firestore/jobs';
import { getEstimateById } from '@/lib/firestore/estimates';
import type { Estimate, Customer, Job } from '@/lib/types';
import { acceptEstimateWithSignature } from '@/app/actions';
import { SubmitButton } from './SubmitButton';

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

function EstimateDetailsPageContent({ estimateId }: { estimateId: string }) {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'admin';
  
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const fetchedEstimate = await getEstimateById(estimateId);
        
        if (!fetchedEstimate) {
            setEstimate(null);
        } else {
            setEstimate(fetchedEstimate);
            const [fetchedCustomer, fetchedJob] = await Promise.all([
                getCustomerById(fetchedEstimate.customerId),
                fetchedEstimate.jobId ? getJobById(fetchedEstimate.jobId) : Promise.resolve(null)
            ]);
            setCustomer(fetchedCustomer);
            setJob(fetchedJob);
        }
        setIsLoading(false);
    };

    fetchData();
  }, [estimateId]);

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      );
  }

  if (!estimate || !customer) {
    notFound();
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
                    <h2 className="text-4xl font-bold text-muted-foreground">ESTIMATE</h2>
                    <p className="font-mono">{estimate.estimateNumber}</p>
                    <p className="text-sm text-muted-foreground mt-2">Date Issued: {format(new Date(estimate.createdAt), 'MMMM d, yyyy')}</p>
                </div>
            </div>
            <Separator className="my-8" />
             <div className="grid grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold mb-2">Bill To:</h3>
                    <p className="font-bold">{customer.primaryContact.name}</p>
                    <p>{customer.companyInfo.address}</p>
                    <p>{customer.primaryContact.email}</p>
                </div>
            </div>
             <Separator className="my-8" />
        </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">{estimate.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">ESTIMATE-{estimate.estimateNumber}</p>
            <Badge className={cn("capitalize", getEstimateStatusStyles(estimate.status))}>
              {estimate.status}
            </Badge>
          </div>
        </div>
        <EstimateActions estimate={estimate} onEstimateUpdate={setEstimate} />
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
                            {estimate.lineItems.map((item, index) => (
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
                        <div className="text-right">{formatCurrency(estimate.subtotal)}</div>
                        <div className="font-medium text-muted-foreground">Discount:</div>
                        <div className="text-right">{formatCurrency(estimate.discount)}</div>
                        <div className="font-medium text-muted-foreground">Tax:</div>
                        <div className="text-right">{formatCurrency(estimate.tax)}</div>
                        <div className="font-bold text-base text-right col-span-2 border-t pt-2 mt-1">
                           {formatCurrency(estimate.total)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {estimate.gbbTier && (
                <Card className="print:shadow-none print:border-none print:mt-12">
                    <CardHeader className="print:p-0">
                        <CardTitle>Pricing Options</CardTitle>
                        <CardDescription className="print:hidden">AI-generated pricing tiers for this estimate.</CardDescription>
                    </CardHeader>
                    <CardContent className="print:p-0">
                         <Tabs defaultValue="good" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 print:hidden">
                                <TabsTrigger value="good">Good</TabsTrigger>
                                <TabsTrigger value="better">Better</TabsTrigger>
                                <TabsTrigger value="best">Best</TabsTrigger>
                            </TabsList>
                            <div className="print:space-y-4">
                               <TabsContent value="good" className="pt-4 border rounded-md p-4 mt-2 print:border-none print:p-0 print:mt-2">
                                    <h4 className="font-bold hidden print:block mb-1">Good Option</h4>
                                    <p className="text-sm text-muted-foreground">{estimate.gbbTier.good}</p>
                                </TabsContent>
                                <TabsContent value="better" className="pt-4 border rounded-md p-4 mt-2 print:border-none print:p-0 print:mt-2">
                                     <h4 className="font-bold hidden print:block mb-1">Better Option</h4>
                                    <p className="text-sm text-muted-foreground">{estimate.gbbTier.better}</p>
                                </TabsContent>
                                <TabsContent value="best" className="pt-4 border rounded-md p-4 mt-2 print:border-none print:p-0 print:mt-2">
                                     <h4 className="font-bold hidden print:block mb-1">Best Option</h4>
                                    <p className="text-sm text-muted-foreground">{estimate.gbbTier.best}</p>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

             <Card className="print:shadow-none print:border-none">
                <CardHeader className="print:p-0">
                    <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="print:p-0">
                    <p className="text-sm text-muted-foreground">{estimate.notes || 'No notes for this estimate.'}</p>
                </CardContent>
            </Card>
            
             {estimate.status === 'sent' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Approval</CardTitle>
                        <CardDescription>The customer can approve this estimate by signing below.</CardDescription>
                    </CardHeader>
                    <form action={acceptEstimateWithSignature}>
                        <input type="hidden" name="estimateId" value={estimate.id} />
                        <CardContent className="space-y-4">
                            <div>
                                <label htmlFor="signature" className="text-sm font-medium">Signature</label>
                                <div id="signature" className="mt-1 w-full h-32 bg-muted rounded-md border-2 border-dashed flex items-center justify-center">
                                    <p className="text-muted-foreground">Signature Pad Placeholder</p>
                                </div>
                                <input type="hidden" name="signature" value="customer_signature_data" />
                            </div>
                            <SubmitButton 
                                label="Accept & Sign" 
                                loadingLabel="Accepting..." 
                                icon={Signature} 
                            />
                        </CardContent>
                    </form>
                </Card>
            )}
             {estimate.status === 'accepted' && (
                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="flex flex-row items-center gap-4">
                         <Check className="w-8 h-8 text-green-600" />
                         <div>
                            <CardTitle className="text-green-800">Estimate Approved</CardTitle>
                            <CardDescription className="text-green-700">This estimate was approved by the customer on {format(new Date(estimate.updatedAt), 'MMMM d, yyyy')}.</CardDescription>
                         </div>
                    </CardHeader>
                </Card>
            )}
        </div>

        <div className="space-y-6 print:hidden">
          <Card>
            <CardHeader>
                <CardTitle>Estimate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <InfoCard icon={Calendar} label="Created Date">
                    {format(new Date(estimate.createdAt), 'MMMM d, yyyy')}
                </InfoCard>
                <InfoCard icon={Calendar} label="Last Updated">
                    {format(new Date(estimate.updatedAt), 'MMMM d, yyyy h:mm a')}
                </InfoCard>
                 <InfoCard icon={User} label="Customer">
                    <Link href={`/dashboard/customers/${customer.id}?role=${role}`} className="text-primary hover:underline">{customer.primaryContact.name}</Link>
                </InfoCard>
                {job && (
                     <InfoCard icon={Tag} label="Linked Job">
                        <Link href={`/dashboard/jobs/${job.id}?role=${role}`} className="text-primary hover:underline">{job.title}</Link>
                    </InfoCard>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


export default function EstimateDetailsPage({ params }: { params: { estimateId: string }}) {
    const { estimateId } = params;
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
            <EstimateDetailsPageContent estimateId={estimateId} />
        </Suspense>
    )
}
