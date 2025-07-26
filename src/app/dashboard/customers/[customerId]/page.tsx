
import { getCustomerData } from '@/lib/firestore';
import { notFound } from 'next/navigation';
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
import { FileText, Calculator, FileDiff, Briefcase, UserPlus, BarChart, MessageSquare } from 'lucide-react';


export default async function CustomerDetailsPage({ params }: { params: { customerId: string } }) {
  const customerId = params.customerId;
  const customerData = await getCustomerData(customerId);

  if (!customerData) {
    notFound();
  }

  const { customer, jobs, estimates, communicationLog, referrals, totals, equipment } = customerData;
  const invoices = mockData.invoices.filter(i => i.customerId === customerId); // Temporary
  const changeOrders = mockData.changeOrders.filter(co => co.customerId === customerId); // Temporary

  const tabs = [
    { value: 'estimates', label: 'Estimates', icon: Calculator, component: <CustomerEstimates estimates={estimates} /> },
    { value: 'invoices', label: 'Invoices', icon: FileText, component: <CustomerInvoices invoices={invoices} /> },
    { value: 'jobs', label: 'Jobs', icon: Briefcase, component: <CustomerJobs jobs={jobs} /> },
    { value: 'change_orders', label: 'Change Orders', icon: FileDiff, component: <CustomerChangeOrders changeOrders={changeOrders} /> },
    { value: 'referrals', label: 'Referrals', icon: UserPlus, component: <CustomerReferrals customer={customer} referrals={referrals || []} /> },
    { value: 'analytics', label: 'Analytics', icon: BarChart, component: <CustomerAnalytics /> },
    { value: 'communication', label: 'Communication', icon: MessageSquare, component: <CustomerCommunication logs={communicationLog || []} /> },
  ];

  return (
    <div className="space-y-6">
      <CustomerHeader customer={customer} totals={totals}/>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 xl:col-span-3">
          <CustomerInfoPanel customer={customer} />
        </div>
        <div className="lg:col-span-9 xl:col-span-9">
          <Tabs defaultValue="estimates" className="w-full">
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
