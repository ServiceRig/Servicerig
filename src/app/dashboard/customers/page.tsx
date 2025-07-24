
'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { Phone, MessageSquare } from 'lucide-react';

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
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(mockData.customers ?? []).map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.primaryContact.firstName}</TableCell>
                  <TableCell>{customer.primaryContact.lastName}</TableCell>
                  <TableCell>{customer.companyInfo.name}</TableCell>
                  <TableCell>{customer.primaryContact.phone}</TableCell>
                  <TableCell>{`${customer.companyInfo.address.street}, ${customer.companyInfo.address.city}, ${customer.companyInfo.address.state} ${customer.companyInfo.address.zipCode}`}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" asChild>
                        <a href={`tel:${customer.primaryContact.phone}`}>
                            <Phone className="h-4 w-4" />
                        </a>
                    </Button>
                     <Button variant="outline" size="icon" asChild>
                        <a href={`sms:${customer.primaryContact.phone}`}>
                            <MessageSquare className="h-4 w-4" />
                        </a>
                    </Button>
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
