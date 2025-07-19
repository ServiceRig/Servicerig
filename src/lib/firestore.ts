
import { mockData } from './mock-data';
import { getJobsByCustomerId } from './firestore/jobs';
import { getEstimatesByCustomerId, getEstimatesByJobId, getEstimateById } from './firestore/estimates';
import type { CustomerData, JobData, EstimateData } from './types';

// In a real app, these would be Firestore SDK calls (getDoc, getDocs, query, where).
// For now, we simulate the data fetching and shaping.

export async function getCustomerData(customerId: string): Promise<CustomerData | null> {
  // Simulate fetching a customer
  const customer = mockData.customers.find(c => c.id === customerId);
  if (!customer) {
    return null;
  }

  // Simulate fetching related data
  const jobsForCustomer = await getJobsByCustomerId(customerId);
  const equipmentForCustomer = mockData.equipment.filter(e => e.customerId === customerId);
  const invoicesForCustomer = mockData.invoices.filter(i => i.customerId === customerId);
  const estimatesForCustomer = await getEstimatesByCustomerId(customerId);
  
  // Enrich job data with technician names
  const enrichedJobs = jobsForCustomer.map(job => {
      const technician = mockData.technicians.find(t => t.id === job.technicianId);
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
    estimates: estimatesForCustomer,
    totals: {
      totalBilled,
      totalPaid,
      totalDirectExpenses: totalBilled * 0.4, // Placeholder for expenses
    },
    linkedRecords: {
      purchaseOrders: 2, // Placeholder
      estimates: estimatesForCustomer.length,
      invoices: invoicesForCustomer.length,
      completedForms: 3, // Placeholder
    },
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return customerData;
}


export async function getJobData(jobId: string): Promise<JobData | null> {
  const job = mockData.jobs.find(j => j.id === jobId);
  if (!job) {
    return null;
  }

  const customer = mockData.customers.find(c => c.id === job.customerId);
  if (!customer) {
    return null; // Or handle as an error, a job must have a customer
  }

  const technician = mockData.technicians.find(t => t.id === job.technicianId);
  const estimates = await getEstimatesByJobId(jobId);

  const jobData: JobData = {
    job,
    customer,
    technician: technician || null, // A job might not have a technician
    estimates: estimates,
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return jobData;
}

export async function getEstimateData(estimateId: string): Promise<EstimateData | null> {
    const estimate = await getEstimateById(estimateId);
    if (!estimate) {
        return null;
    }

    const customer = mockData.customers.find(c => c.id === estimate.customerId);
    if (!customer) {
        return null;
    }

    const job = estimate.jobId ? mockData.jobs.find(j => j.id === estimate.jobId) : null;

    const estimateData: EstimateData = {
        estimate,
        customer,
        job: job || null,
    };

    return estimateData;
}
