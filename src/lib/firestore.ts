

import { mockData } from './mock-data';
import { getJobsByCustomerId } from './firestore/jobs';
import { getEstimatesByCustomerId, getEstimatesByJobId, getEstimateById } from './firestore/estimates';
import type { Customer, CustomerData, JobData, EstimateData, PurchaseOrderData } from './types';

// In a real app, these would be Firestore SDK calls (getDoc, getDocs, query, where).
// For now, we simulate the data fetching and shaping.

export async function getCustomerData(customerId: string): Promise<CustomerData | null> {
  // Simulate fetching a customer
  const customer = mockData.customers.find((c: Customer) => c.id === customerId);
  if (!customer) {
    return null;
  }

  // Simulate fetching related data
  const jobsForCustomer = await getJobsByCustomerId(customerId);
  const equipmentForCustomer = mockData.equipment.filter((e: any) => e.customerId === customerId);
  const invoicesForCustomer = mockData.invoices.filter((i: any) => i.customerId === customerId);
  const estimatesForCustomer = await getEstimatesByCustomerId(customerId);
  const depositsForCustomer = mockData.deposits.filter((d: any) => d.customerId === customerId);
  
  // Enrich job data with technician names
  const enrichedJobs = jobsForCustomer.map(job => {
      const technician = mockData.technicians.find((t: any) => t.id === job.technicianId);
      return {
          ...job,
          technicianName: technician ? technician.name : 'Unassigned',
      };
  });

  // Simulate financial calculations
  const totalBilled = invoicesForCustomer.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoicesForCustomer
    .reduce((sum, inv) => sum + inv.amountPaid, 0);

  // Combine into the final data structure
  const customerData: CustomerData = {
    customer,
    equipment: equipmentForCustomer,
    jobs: enrichedJobs,
    estimates: estimatesForCustomer,
    deposits: depositsForCustomer,
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
      deposits: depositsForCustomer.filter((d: any) => d.status === 'available').length,
    },
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return customerData;
}


export async function getJobData(jobId: string): Promise<JobData | null> {
  const job = mockData.jobs.find((j: any) => j.id === jobId);
  if (!job) {
    return null;
  }

  const customer = mockData.customers.find((c: any) => c.id === job.customerId);
  if (!customer) {
    return null; // Or handle as an error, a job must have a customer
  }

  const technician = mockData.technicians.find((t: any) => t.id === job.technicianId);
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

    const customer = mockData.customers.find((c: any) => c.id === estimate.customerId);
    if (!customer) {
        return null;
    }

    const job = estimate.jobId ? mockData.jobs.find((j: any) => j.id === estimate.jobId) : null;

    const estimateData: EstimateData = {
        estimate,
        customer,
        job: job || null,
    };

    return estimateData;
}

export async function getPurchaseOrderData(poId: string): Promise<PurchaseOrderData | null> {
  const po = mockData.purchaseOrders.find((p: any) => p.id === poId);
  if (!po) {
    return null;
  }

  // Enrich parts data with names
  po.parts = po.parts.map((part: any) => {
    const itemDetails = mockData.inventoryItems.find((i: any) => i.id === part.partId);
    return { ...part, itemName: itemDetails?.name || 'Unknown Part' };
  });

  const requestedBy = mockData.technicians.find((t: any) => t.id === po.requestedBy)?.name || null;
  
  let destinationName = 'Warehouse';
  if (po.destination !== 'Warehouse') {
    destinationName = mockData.technicians.find((t: any) => t.id === po.destination)?.name || 'Unknown Technician';
  }

  const poData: PurchaseOrderData = {
    po,
    requestedBy,
    destinationName,
  };
  
  await new Promise(resolve => setTimeout(resolve, 300));

  return poData;
}
