
'use client';

import { getCustomerData } from '@/lib/firestore';
import { notFound, useRouter } from 'next/navigation';
import { CustomerHeader } from '@/components/dashboard/customer/CustomerHeader';
import { CustomerInfoPanel } from '@/components/dashboard/customer/CustomerInfoPanel';
import { CustomerJobs } from '@/components/dashboard/customer/CustomerJobs';
import { CustomerEstimates } from '@/components/dashboard/customer/CustomerEstimates';
import { CustomerInvoices } from '@/components/dashboard/customer/CustomerInvoices';
import { CustomerChangeOrders } from '@/components/dashboard/customer/CustomerChangeOrders';
import { CustomerReferrals } from '@/components/dashboard/customer/CustomerReferrals';
import { CustomerAnalytics } from '@/components/dashboard/customer/CustomerAnalytics';
import { CustomerCommunication } from '@/components/dashboard/customer/CustomerCommunication';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Calculator, FileDiff, Briefcase, UserPlus, BarChart, MessageSquare, ArrowLeft } from 'lucide-react';
import { mockData } from '@/lib/mock-data';
import { useState, useEffect, useCallback, Suspense, use } from 'react';
import { Loader2 } from 'lucide-react';
import type { Customer, Job, Estimate, CommunicationLog, Referral, Equipment, CustomerData } from '@/lib/types';
import { Button } from '@/components/ui/button';


function CustomerDetailsPageContent({ params }: { params: { customerId: string } }) {
  const customerId = params.customerId;
  const router = useRouter();
  const [data, setData] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const customerData = await getCustomerData(customerId);
    if (customerData) {
      setData(customerData);
    }
    setIsLoading(false);
  }, [customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleCustomerUpdate = useCallback((updatedCustomer: Customer) => {
    setData(prevData => {
        if (!prevData) return null;
        return { ...prevData, customer: updatedCustomer };
    });
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!data) {
    notFound();
  }

  const { customer, jobs, estimates, communicationLog, referrals, totals, equipment } = data;
  const invoices = mockData.invoices.filter((i: any) => i.customerId === customerId); // Temporary
  const changeOrders = mockData.changeOrders.filter((co: any) => co.customerId === customerId); // Temporary

  const tabs = [
    { value: 'referrals', label: 'Referrals', icon: UserPlus, component: <CustomerReferrals customer={customer} referrals={referrals || []} /> },
    { value: 'estimates', label: 'Estimates', icon: Calculator, component: <CustomerEstimates estimates={estimates} /> },
    { value: 'invoices', label: 'Invoices', icon: FileText, component: <CustomerInvoices invoices={invoices} /> },
    { value: 'jobs', label: 'Jobs', icon: Briefcase, component: <CustomerJobs jobs={jobs} /> },
    { value: 'change_orders', label: 'Change Orders', icon: FileDiff, component: <CustomerChangeOrders changeOrders={changeOrders} /> },
    { value: 'analytics', label: 'Analytics', icon: BarChart, component: <CustomerAnalytics /> },
    { value: 'communication', label: 'Communication', icon: MessageSquare, component: <CustomerCommunication logs={communicationLog || []} /> },
  ];

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-grow">
                 <h1 className="text-3xl font-bold">Customer Profile</h1>
            </div>
        </div>
      <CustomerHeader customer={customer} onCustomerUpdate={handleCustomerUpdate} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 xl:col-span-3">
          <CustomerInfoPanel customer={customer} />
        </div>
        <div className="lg:col-span-9 xl:col-span-9">
          <Tabs defaultValue="referrals" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {tabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="mt-4">
                {tab.component}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDetailsPage({ params }: { params: Promise<{ customerId: string }> }) {
    const resolvedParams = use(params);
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <CustomerDetailsPageContent params={resolvedParams} />
        </Suspense>
    )
}
