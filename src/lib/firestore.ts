
import { mockCustomers, mockJobs, mockEquipment, mockInvoices, mockTechnicians } from './mock-data';
import type { CustomerData, JobData } from './types';

// In a real app, these would be Firestore SDK calls (getDoc, getDocs, query, where).
// For now, we simulate the data fetching and shaping.

export async function getCustomerData(customerId: string): Promise<CustomerData | null> {
  // Simulate fetching a customer
  const customer = mockCustomers.find(c => c.id === customerId);
  if (!customer) {
    return null;
  }

  // Simulate fetching related data
  const jobsForCustomer = mockJobs.filter(j => j.customerId === customerId);
  const equipmentForCustomer = mockEquipment.filter(e => e.customerId === customerId);
  const invoicesForCustomer = mockInvoices.filter(i => i.customerId === customerId);
  
  // Enrich job data with technician names
  const enrichedJobs = jobsForCustomer.map(job => {
      const technician = mockTechnicians.find(t => t.id === job.technicianId);
      return {
          ...job,
          technicianName: technician ? technician.name : 'Unassigned',
      };
  });

  // Simulate financial calculations
  const totalBilled = invoicesForCustomer.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoicesForCustomer
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Combine into the final data structure
  const customerData: CustomerData = {
    customer,
    equipment: equipmentForCustomer,
    jobs: enrichedJobs,
    totals: {
      totalBilled,
      totalPaid,
      totalDirectExpenses: totalBilled * 0.4, // Placeholder for expenses
    },
    linkedRecords: {
      purchaseOrders: 2, // Placeholder
      estimates: 1, // Placeholder
      invoices: invoicesForCustomer.length,
      completedForms: 3, // Placeholder
    },
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return customerData;
}


export async function getJobData(jobId: string): Promise<JobData | null> {
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) {
    return null;
  }

  const customer = mockCustomers.find(c => c.id === job.customerId);
  if (!customer) {
    return null; // Or handle as an error, a job must have a customer
  }

  const technician = mockTechnicians.find(t => t.id === job.technicianId);

  const jobData: JobData = {
    job,
    customer,
    technician: technician || null, // A job might not have a technician
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return jobData;
}
