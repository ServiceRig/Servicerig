'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockInvoices } from '@/lib/mock-data';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { mockCustomers } from "@/lib/mock-data";

export function InvoiceView() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage and track customer invoices.</CardDescription>
        </div>
        <Sheet>
            <SheetTrigger asChild>
                <Button>Create Invoice</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Create New Invoice</SheetTitle>
                    <SheetDescription>
                        Fill out the details to generate a new invoice.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer" className="text-right">Customer</Label>
                        <Select>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.primaryContact.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount</Label>
                        <Input id="amount" type="number" placeholder="$0.00" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                        <Input id="dueDate" type="date" className="col-span-3" />
                    </div>
                </div>
                <SheetFooter>
                    <Button type="submit" className="bg-accent hover:bg-accent/90">Save Invoice</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={invoice.status === 'Paid' ? 'default' : 'destructive'}
                    className={invoice.status === 'Paid' ? `bg-green-500 hover:bg-green-600` : `bg-red-500 hover:bg-red-600`}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Pay with Stripe</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
