
import { getPurchaseOrderData } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Package, Calendar, User, Truck, Warehouse, DollarSign, FileText, CheckCheck, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PurchaseOrder } from '@/lib/types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import Image from 'next/image';

const getStatusStyles = (status: PurchaseOrder['status']) => {
  switch (status) {
    case 'ordered': return 'bg-blue-500 text-white';
    case 'received': return 'bg-green-500 text-white';
    case 'delivered': return 'bg-purple-500 text-white';
    case 'completed': return 'bg-green-600 text-white';
    case 'field-purchased': return 'bg-orange-500 text-white';
    case 'draft':
    default: return 'bg-gray-500 text-white';
  }
};

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

export default async function PurchaseOrderDetailsPage({ params }: { params: { poId: string }}) {
  const poId = params.poId;
  const data = await getPurchaseOrderData(poId);

  if (!data) {
    notFound();
  }

  const { po, requestedBy, destinationName } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Purchase Order</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">PO-{po.id.toUpperCase()}</p>
            <Badge className={cn("capitalize", getStatusStyles(po.status))}>
              {po.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Edit className="mr-2 h-4 w-4"/> Edit PO</Button>
            <Button><FileText className="mr-2 h-4 w-4"/> Send to Vendor</Button>
        </div>
      </div>
      
      <Separator />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Vendor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InfoCard icon={Package} label="Vendor">
                        {po.vendor}
                    </InfoCard>
                    <InfoCard icon={DollarSign} label="Total Cost">
                        <span className="font-bold">{formatCurrency(po.total)}</span>
                    </InfoCard>
                </CardContent>
            </Card>

           <Card>
            <CardHeader>
              <CardTitle>Ordered Items</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Part Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Unit Cost</TableHead>
                            <TableHead className="text-right">Line Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {po.parts.map((part) => (
                            <TableRow key={part.partId}>
                                <TableCell className="font-medium">{part.itemName}</TableCell>
                                <TableCell>{part.qty}</TableCell>
                                <TableCell className="text-right">{formatCurrency(part.unitCost)}</TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(part.qty * part.unitCost)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
          
           {po.isFieldPurchase && po.receiptImage && (
             <Card>
                <CardHeader>
                    <CardTitle>Receipt</CardTitle>
                </CardHeader>
                <CardContent>
                    <Image src={po.receiptImage} alt={`Receipt for PO ${po.id}`} width={400} height={600} className="rounded-md border"/>
                </CardContent>
            </Card>
          )}

        </div>

        {/* Side Content - Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>Order & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <InfoCard icon={Calendar} label="Order Date">
                    {format(new Date(po.orderDate), 'MMMM d, yyyy')}
                </InfoCard>
                <InfoCard icon={Calendar} label="Expected Delivery">
                     {po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), 'MMMM d, yyyy') : 'N/A'}
                </InfoCard>
                <InfoCard icon={po.destination === 'Warehouse' ? Warehouse : Truck} label="Destination">
                    {destinationName}
                </InfoCard>
                 <InfoCard icon={User} label="Requested By">
                    {requestedBy || 'System'}
                </InfoCard>
            </CardContent>
          </Card>
          
           {po.status !== 'ordered' && po.status !== 'pending' && (
              <Card>
                <CardHeader>
                    <CardTitle>Receiving Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <InfoCard icon={CheckCheck} label="Received Date">
                        {po.receivedAt ? format(new Date(po.receivedAt), 'MMMM d, yyyy, h:mm a') : 'N/A'}
                    </InfoCard>
                    <InfoCard icon={User} label="Received By">
                        {po.receivedBy || 'N/A'}
                    </InfoCard>
                     <InfoCard icon={FileText} label="Notes">
                        {po.deliveryNotes || 'No notes provided.'}
                    </InfoCard>
                </CardContent>
              </Card>
           )}
        </div>
      </div>
    </div>
  );
}
