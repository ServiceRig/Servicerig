// In a real app, you would import the firestore instance:
// import { db } from './firebase';
// import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { mockData } from '@/lib/mock-data';
import type { Job } from '@/lib/types';
import { functions } from './firebase'; // Assuming you have this configured
import { httpsCallable } from 'firebase/functions';

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
    await new Promise(resolve => setTimeout(resolve, 50));

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
 * @param jobData The job data to add.
 * @returns The newly created job object.
 */
export async function addJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const newJob: Job = {
        id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...jobData,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    mockData.jobs.unshift(newJob);
    
    return newJob;
}

/**
 * Updates an existing job in the mock data.
 * @param updatedJob The job object with updated fields.
 */
export async function updateJob(updatedJob: Job): Promise<void> {
    console.log("Updating job in DB:", updatedJob.id);
    const index = mockData.jobs.findIndex(j => j.id === updatedJob.id);
    if (index !== -1) {
        mockData.jobs[index] = { ...mockData.jobs[index], ...updatedJob };
    } else {
        console.warn(`Job with id ${updatedJob.id} not found for update, adding it instead.`);
        mockData.jobs.unshift(updatedJob);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
}
