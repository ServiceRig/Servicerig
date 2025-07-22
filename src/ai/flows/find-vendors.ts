'use server';
/**
 * @fileOverview An AI agent for finding local vendors and suppliers.
 *
 * - findVendors - A function that handles the vendor search process.
 * - FindVendorsInput - The input type for the findVendors function.
 * - FindVendorsOutput - The return type for the findVendors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const FindVendorsInputSchema = z.object({
  query: z.string().describe('The user\'s search query, including the type of vendor and location. For example: "plumbing supply house near Dallas, TX" or "HVAC parts distributors in zip code 75001".'),
});
export type FindVendorsInput = z.infer<typeof FindVendorsInputSchema>;

const VendorSchema = z.object({
    name: z.string().describe('The full business name of the vendor.'),
    contactName: z.string().describe('A likely contact person, such as "Sales Department" or a person\'s name if available.'),
    phone: z.string().describe('The main phone number for the vendor.'),
    email: z.string().describe('The primary contact email address.'),
    website: z.string().describe('The vendor\'s website URL.'),
    address: z.string().describe('The full physical street address of the vendor.'),
    trades: z.array(z.enum(['Plumbing', 'HVAC', 'Electrical', 'General'])).describe('An array of trades this vendor primarily serves.'),
    categories: z.array(z.string()).describe('An array of product categories the vendor likely sells, e.g., ["Fittings", "Water Heaters", "PEX Tubing"].'),
});

export const FindVendorsOutputSchema = z.object({
  vendors: z.array(VendorSchema).describe('A list of vendors that match the search query.'),
});
export type FindVendorsOutput = z.infer<typeof FindVendorsOutputSchema>;


export async function findVendors(input: FindVendorsInput): Promise<FindVendorsOutput> {
  return findVendorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findVendorsPrompt',
  input: {schema: FindVendorsInputSchema},
  output: {schema: FindVendorsOutputSchema},
  prompt: `You are a business directory assistant for a field service company. Your task is to find local suppliers based on a user's query.

You must find real-world, accurate information if possible, but act as a perfect directory. Generate a list of 3-5 vendors that match the user's search criteria.

For each vendor, you need to provide:
-   A plausible business name.
-   A contact person (can be generic like "Pro Desk").
-   A valid-looking phone number and email address.
-   A website URL.
-   A full street address.
-   The primary trades they serve.
-   A list of likely product categories they offer.

Return the response in the requested JSON format. Do not make up information that isn't reasonably expected for a business directory.

User Query: "{{{query}}}"`,
});

const findVendorsFlow = ai.defineFlow(
  {
    name: 'findVendorsFlow',
    inputSchema: FindVendorsInputSchema,
    outputSchema: FindVendorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
