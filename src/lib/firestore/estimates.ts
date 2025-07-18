
import { mockEstimates } from '@/lib/mock-data';
import type { Estimate } from '@/lib/types';

/**
 * Fetches a single estimate by its ID.
 * @param id The estimate's ID.
 * @returns An Estimate object or null if not found.
 */
export async function getEstimateById(id: string): Promise<Estimate | null> {
    console.log(`Fetching estimate with id: ${id}`);
    // Simulate Firestore getDoc
    const estimate = mockEstimates.find(e => e.id === id) || null;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!estimate) {
        console.error(`Estimate with id ${id} not found.`);
        return null;
    }
    return estimate;
}

/**
 * Fetches estimates for a given customer.
 * @param customerId The ID of the customer.
 * @returns An array of Estimate objects.
 */
export async function getEstimatesByCustomerId(customerId: string): Promise<Estimate[]> {
    console.log(`Fetching estimates for customer id: ${customerId}`);
    // Simulate Firestore query
    const estimates = mockEstimates.filter(e => e.customerId === customerId);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return estimates;
}

/**
 * Fetches estimates for a given job.
 * @param jobId The ID of the job.
 * @returns An array of Estimate objects.
 */
export async function getEstimatesByJobId(jobId: string): Promise<Estimate[]> {
    console.log(`Fetching estimates for job id: ${jobId}`);
    // Simulate Firestore query
    const estimates = mockEstimates.filter(e => e.jobId === jobId);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return estimates;
}

/**
 * Adds a new estimate to the mock data.
 * @param estimate The estimate object to add.
 */
export function addEstimate(estimate: Estimate) {
    mockEstimates.unshift(estimate);
}
