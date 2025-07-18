
import { getEstimateData } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { User, Calendar, Tag, FileText } from 'lucide-react';
import { cn, getEstimateStatusStyles } from '@/lib/utils';
import type { Estimate } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { convertEstimateToInvoice } from '@/app/actions';
import { SubmitButton } from './SubmitButton';
import { StatusUpdateButtons } from './StatusUpdateButtons';


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const InfoCard = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div className="flex-grow">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="font-medium text-sm">{children}</div>
        </div>
    </div>
);


export default async function EstimateDetailsPage({ params, searchParams }: { params: { estimateId: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const estimateId = params.estimateId;
  const role = searchParams.role || 'admin';
  const data = await getEstimateData(estimateId);

  if (!data) {
    notFound();
  }

  const { estimate, customer, job } = data;
  const convertAction = convertEstimateToInvoice.bind(null, estimate.id);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{estimate.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">ESTIMATE-{estimate.estimateNumber}</p>
            <Badge className={cn("capitalize", getEstimateStatusStyles(estimate.status))}>
              {estimate.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">Edit Estimate</Button>
            <StatusUpdateButtons estimate={estimate} />
             {estimate.status === 'accepted' && (
                <form action={convertAction}>
                    <SubmitButton
                        label="Convert to Invoice"
                        loadingLabel="Converting..."
                        disabled={estimate.status !== 'accepted'}
                    />
                </form>
             )}
        </div>
      </div>
      
      <Separator />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Good / Better / Best Tiers</CardTitle>
                        <CardDescription>AI-generated pricing tiers for this estimate.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Tabs defaultValue="good" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="good">Good</TabsTrigger>
                                <TabsTrigger value="better">Better</TabsTrigger>
                                <TabsTrigger value="best">Best</TabsTrigger>
                            </TabsList>
                            <TabsContent value="good" className="pt-4 border rounded-md p-4 mt-2">
                                <p className="text-sm text-muted-foreground">{estimate.gbbTier.good}</p>
                            </TabsContent>
                            <TabsContent value="better" className="pt-4 border rounded-md p-4 mt-2">
                                <p className="text-sm text-muted-foreground">{estimate.gbbTier.better}</p>
                            </TabsContent>
                            <TabsContent value="best" className="pt-4 border rounded-md p-4 mt-2">
                                <p className="text-sm text-muted-foreground">{estimate.gbbTier.best}</p>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

             <Card>
                <CardHeader>
                    <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{estimate.notes || 'No notes for this estimate.'}</p>
                </CardContent>
            </Card>

        </div>

        {/* Side Content - Right Column */}
        <div className="space-y-6">
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
