// In a real app, you would import the firestore instance:
// import { db } from './firebase';
// import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { mockData } from '@/lib/mock-data';
import type { Job } from '@/lib/types';

/**
 * Fetches a single job by its ID.
 * @param id The job's ID.
 * @returns A Job object or null if not found.
 */
export async function getJobById(id: string): Promise<Job | null> {
    console.log(`Fetching job with id: ${id}`);
    // Simulate Firestore getDoc
    const job = mockData.jobs.find(j => j.id === id) || null;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!job) {
        // This can happen in dev with hot-reloading, so we don't want to spam the console.
        // console.error(`Job with id ${id} not found.`);
        return null;
    }
    return job;
}

/**
 * Fetches all jobs for a given customer.
 * In a real app, this would use a query with a 'where' clause.
 * @param customerId The ID of the customer.
 * @returns An array of Job objects.
 */
export async function getJobsByCustomerId(customerId: string): Promise<Job[]> {
    console.log(`Fetching jobs for customer id: ${customerId}`);
    // Simulate Firestore query
    const jobs = mockData.jobs.filter(j => j.customerId === customerId);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return jobs;
}


/**
 * Adds a new job to the mock data.
 * @param job The job object to add.
 */
export async function addJob(job: Job) {
    console.log("Adding job to DB:", job.id);
    mockData.jobs.unshift(job);
    await new Promise(resolve => setTimeout(resolve, 100));
}
