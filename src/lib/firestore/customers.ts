// In a real app, you would import the firestore instance:
// import { db } from './firebase'; 
// import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { mockCustomers } from '@/lib/mock-data';
import type { Customer } from '@/lib/types';

/**
 * Fetches a single customer by their ID.
 * In a real app, this would use getDoc.
 * @param id The customer's ID.
 * @returns A Customer object or null if not found.
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  console.log(`Fetching customer with id: ${id}`);
  // Simulate firestore getDoc
  const customer = mockCustomers.find(c => c.id === id) || null;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  if (!customer) {
    console.error(`Customer with id ${id} not found.`);
    return null;
  }
  return customer;
}

/**
 * Fetches all customers.
 * In a real app, this would use getDocs.
 * @returns An array of Customer objects.
 */
export async function getAllCustomers(): Promise<Customer[]> {
    console.log("Fetching all customers...");
    // Simulate firestore getDocs
    const customers = mockCustomers;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return customers;
}
