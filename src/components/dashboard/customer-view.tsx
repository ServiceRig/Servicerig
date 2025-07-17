'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { mockCustomers, mockJobs } from '@/lib/mock-data';
import { Customer } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';

export function CustomerView() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const getCustomerJobs = (customerId: string) => {
    return mockJobs.filter(job => job.customerId === customerId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>Manage your customer relationships.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
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
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleCustomerSelect(customer)}>
                        View Details
                      </Button>
                    </DialogTrigger>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {selectedCustomer && (
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedCustomer.primaryContact.name}</DialogTitle>
                <DialogDescription>{selectedCustomer.companyInfo.name}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold mb-2">Contact Info</h4>
                        <p><strong>Email:</strong> {selectedCustomer.primaryContact.email}</p>
                        <p><strong>Phone:</strong> {selectedCustomer.primaryContact.phone}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Address</h4>
                        <p>{selectedCustomer.companyInfo.address}</p>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Service History</h4>
                    <div className="border rounded-md max-h-60 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {getCustomerJobs(selectedCustomer.id).map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell>{job.schedule.start.toLocaleDateString()}</TableCell>
                                        <TableCell>{job.details.serviceType}</TableCell>
                                        <TableCell>
                                            <Badge variant={job.status === 'Completed' ? 'default' : 'secondary'} className={job.status === 'Completed' ? 'bg-green-500' : ''}>{job.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {getCustomerJobs(selectedCustomer.id).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">No service history found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
}
