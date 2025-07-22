
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

const FindVendorsInputSchema = z.object({
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

const FindVendorsOutputSchema = z.object({
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
  prompt: `You are an expert sourcing assistant for a field service company. Your task is to find real, existing local suppliers based on a user's query. Prioritize accuracy and real-world data.

**Your Goal:** Generate a list of 3-5 highly relevant vendors that match the user's search criteria. Try to include a mix of major national suppliers (like Ferguson, Johnstone Supply) and well-known local suppliers.

**If the user's query mentions a specific business name (e.g., "APEX plumbing supply"), you MUST include that business in the results if it matches the location and trade.**

User Query: "{{{query}}}"

For each vendor, you must provide:
-   The full, correct business name.
-   A plausible contact person (e.g., "Pro Desk", "Sales Department").
-   A valid-looking phone number and email address.
-   A real website URL if one exists.
-   A full, real street address.
-   The primary trades they serve.
-   A list of likely product categories they offer.

Return the response in the requested JSON format. Do not invent information. If you cannot find a real-world match, it is better to return fewer, accurate results.`,
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
