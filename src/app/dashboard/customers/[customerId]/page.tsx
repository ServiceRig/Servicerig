
import { getCustomerData } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import { CustomerHeader } from '@/components/dashboard/customer/CustomerHeader';
import { CustomerStats } from '@/components/dashboard/customer/CustomerStats';
import { CustomerEquipment } from '@/components/dashboard/customer/CustomerEquipment';
import { CustomerServiceHistory } from '@/components/dashboard/customer/CustomerServiceHistory';
import { CustomerLinkedRecords } from '@/components/dashboard/customer/CustomerLinkedRecords';
import { Separator } from '@/components/ui/separator';
import { CustomerEstimates } from '@/components/dashboard/customer/CustomerEstimates';
import { CustomerDeposits } from '@/components/dashboard/customer/CustomerDeposits';

export default async function CustomerDetailsPage({ params }: { params: { customerId: string } }) {
  const customerId = params.customerId;
  const customerData = await getCustomerData(customerId);

  if (!customerData) {
    notFound();
  }

  const { customer, equipment, jobs, totals, linkedRecords, estimates, deposits } = customerData;

  return (
    <div className="space-y-6">
      <CustomerHeader customer={customer} />
      <CustomerStats totals={totals} />
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CustomerServiceHistory jobs={jobs} />
          <CustomerEstimates estimates={estimates} />
        </div>
        <div className="space-y-6">
          <CustomerEquipment equipment={equipment} />
          <CustomerDeposits deposits={deposits} />
          <CustomerLinkedRecords records={linkedRecords} />
        </div>
      </div>
    </div>
  );
}
