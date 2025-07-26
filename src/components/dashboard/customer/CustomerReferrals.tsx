
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Customer, Referral } from "@/lib/types";
import { format } from "date-fns";
import { Copy, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const getStatusBadge = (status: Referral['status']) => {
    switch (status) {
        case 'converted': return <Badge className="bg-green-500 text-white">Converted</Badge>;
        case 'pending': return <Badge variant="secondary">Pending</Badge>;
        case 'contacted': return <Badge className="bg-blue-500 text-white">Contacted</Badge>;
        case 'declined': return <Badge variant="destructive">Declined</Badge>;
        default: return <Badge>{status}</Badge>;
    }
}

export function CustomerReferrals({ customer, referrals }: { customer: Customer, referrals: Referral[] }) {
    const { toast } = useToast();
    
    const handleCopy = () => {
        const referralLink = `https://servicerig.com/referral?code=${customer.referralCode}`;
        navigator.clipboard.writeText(referralLink);
        toast({
            title: "Referral Link Copied!",
            description: "The customer's unique referral link has been copied to your clipboard.",
        });
    };
    
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Code</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.referralCode}</div>
            <p className="text-xs text-muted-foreground">Share this code with friends</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.successfulConversions || 0}</div>
            <p className="text-xs text-muted-foreground">Total referrals that became customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
             <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(customer.availableCredit || 0)}</div>
             <p className="text-xs text-muted-foreground">Credit earned from referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.referralTier || 'Bronze'}</div>
            <p className="text-xs text-muted-foreground">Keep referring to level up!</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referrals Made</CardTitle>
          <CardDescription>A list of people this customer has referred.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referred Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Incentive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-medium">{referral.referredCustomerName}</TableCell>
                  <TableCell>{format(new Date(referral.dateReferred), 'PP')}</TableCell>
                  <TableCell>{getStatusBadge(referral.status)}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">{formatCurrency(referral.incentiveEarned || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
