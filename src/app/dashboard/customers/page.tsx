
'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockCustomers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/lib/types';
import { useRole } from '@/hooks/use-role';

export default function CustomersPage() {
  const { role } = useRole();

  const getHref = (customerId: string) => {
    return `/dashboard/customers/${customerId}?role=${role || UserRole.Admin}`
  }

  return (
     <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>Manage your customer relationships.</CardDescription>
      </CardHeader>
      <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.primaryContact.name}</TableCell>
                  <TableCell>{customer.companyInfo.name}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                       <Link href={getHref(customer.id)}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
}
