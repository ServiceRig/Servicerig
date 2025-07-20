
import { mockData } from '@/lib/mock-data';
import type { Invoice } from '@/lib/types';

/**
 * Adds a new invoice to the mock data.
 * @param invoice The invoice object to add.
 */
export async function addInvoice(invoice: Invoice): Promise<void> {
    console.log("Adding invoice to DB:", invoice.id);
    // Add to the beginning of the array so it's visible on the list
    mockData.invoices.unshift(invoice);
    await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Updates an existing invoice in the mock data.
 * @param updatedInvoice The invoice object with updated fields.
 */
export async function updateInvoice(updatedInvoice: Invoice): Promise<void> {
    console.log("Updating invoice in DB:", updatedInvoice.id);
    const index = mockData.invoices.findIndex(i => i.id === updatedInvoice.id);
    if (index !== -1) {
        mockData.invoices[index] = updatedInvoice;
    } else {
        console.warn(`Invoice with id ${updatedInvoice.id} not found for update, adding it instead.`);
        mockData.invoices.unshift(updatedInvoice);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
}
