
'use server';
/**
 * @fileOverview An AI agent for finding local vendors and suppliers using Google Search.
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


const googleSearch = ai.defineTool(
    {
        name: 'googleSearch',
        description: 'Performs a Google search to find information. Use this to find real-world suppliers and businesses.',
        inputSchema: z.object({
            query: z.string().describe('The search query.')
        }),
        outputSchema: z.object({
            results: z.array(z.object({
                title: z.string(),
                link: z.string(),
                snippet: z.string(),
            }))
        })
    },
    async (input) => {
        console.log(`Performing mock Google Search for: ${input.query}`);
        // In a real application, you would integrate with the Google Search API here.
        // For this simulation, we'll return mock data based on the user's example.
        if (input.query.toLowerCase().includes('plumbing supply greenville, tx')) {
            return {
                results: [
                    {
                        title: 'APEX Plumbing Supply Co. | Greenville, TX',
                        link: 'https://www.apexplumbingsupply.com/greenville',
                        snippet: 'APEX Plumbing Supply Co. is a leading distributor of plumbing supplies and fixtures in Greenville, Texas. We offer a wide range of products for residential and commercial applications.'
                    },
                    {
                        title: 'Ferguson Plumbing Supply - Greenville, TX',
                        link: 'https://www.ferguson.com/branch/greenville-tx-plumbing',
                        snippet: 'Visit Ferguson Plumbing Supply in Greenville for the best plumbing products, tools, and supplies.'
                    }
                ]
            }
        }
        return { results: [] };
    }
);


const prompt = ai.definePrompt({
  name: 'findVendorsPrompt',
  tools: [googleSearch],
  input: {schema: FindVendorsInputSchema},
  output: {schema: FindVendorsOutputSchema},
  prompt: `You are an expert sourcing assistant for a field service company. Your task is to find real, existing local suppliers based on a user's query.

**Your Process:**
1.  **Use the 'googleSearch' tool** with the user's query to find relevant businesses.
2.  Analyze the search results to identify 3-5 of the most relevant suppliers. Prioritize accuracy and real-world data.
3.  **If the user's query mentions a specific business name (e.g., "APEX plumbing supply"), you MUST include that business in the results if it appears in the search results.**
4.  Use the information from the search results (title, snippet, etc.) to populate the vendor details in the required JSON format.

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
