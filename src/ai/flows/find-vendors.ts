'use server';
/**
 * @fileOverview An AI agent for finding and vetting potential vendors using a search tool.
 *
 * - findVendors - A function that handles the vendor discovery process.
 * - FindVendorsOutput - The return type for the findVendors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Mocked Google Search Tool
const googleSearch = ai.defineTool(
  {
    name: 'googleSearch',
    description: 'Performs a Google search to find suppliers, vendors, or businesses. Returns a list of search results with names, addresses, and snippets.',
    inputSchema: z.object({
      query: z.string().describe('The search query, e.g., "plumbing suppliers in Austin, TX".'),
    }),
    outputSchema: z.object({
      results: z.array(z.object({
        name: z.string(),
        address: z.string(),
        phone: z.string().optional(),
        website: z.string().optional(),
        rating: z.number().optional().describe('The Google Maps rating out of 5.'),
        snippet: z.string().describe('A small snippet from the search result.'),
      })),
    }),
  },
  async ({query}) => {
    console.log(`Simulating Google Search for: ${query}`);
    // In a real app, this would call the Google Search API.
    // Here we return mock data tailored to the request to ensure accuracy.
    if (query.toLowerCase().includes('plumbing') && query.toLowerCase().includes('greenville')) {
      return {
        results: [
          { name: 'Greenville Supply Co Inc', address: '2120 Washington St, Greenville, TX', phone: '903-454-3304', rating: 4.9, snippet: 'Staff is very knowledgeable about plumbing and easy to deal with.' },
          { name: 'Apex Supply Company', address: '7912 Traders Cir, Greenville, TX', phone: '903-454-1152', rating: 4.8, snippet: 'Danny has great customer service skills and knows his supplies!' },
          { name: 'Ferguson Plumbing Supply', address: 'Nearby in Sulphur Springs, TX', phone: '903-885-3311', rating: 4.7, snippet: 'Large national plumbing supplier, nearest branch to Greenville.' },
        ]
      }
    }
     // Add another mock for a different query to show it's dynamic
    if (query.toLowerCase().includes('hvac') && query.toLowerCase().includes('dallas')) {
        return {
            results: [
                { name: 'Johnstone Supply', address: '123 HVAC Way, Dallas, TX', phone: '214-555-1212', rating: 4.8, snippet: 'Wholesale HVAC parts and supplies.'},
                { name: 'RE Michel Company', address: '456 Industrial Dr, Dallas, TX', phone: '214-555-1313', rating: 4.6, snippet: 'HVACR distributor for over 80 years.'},
                { name: 'Carrier Enterprise', address: '789 Freon Ln, Dallas, TX', phone: '214-555-1414', rating: 4.7, snippet: 'Official Carrier HVAC parts distributor.'},
            ]
        }
    }
    return { // Generic fallback
      results: [
          { name: 'Generic Supply', address: 'Anytown, USA', phone: '555-1234', rating: 4.2, snippet: 'A generic supply house.' },
          { name: 'Vendor Central', address: 'Big City, USA', phone: '555-5678', rating: 3.9, snippet: 'We sell things.' },
      ]
    }
  }
);


const VendorSchema = z.object({
  name: z.string().describe('The full name of the vendor.'),
  contactName: z.string().optional().describe('A point of contact, if available.'),
  phone: z.string().optional().describe('The primary phone number.'),
  email: z.string().optional().describe('The primary contact email.'),
  website: z.string().optional().describe("The vendor's website URL."),
  locations: z.array(z.object({ address: z.string() })).describe('A list of known locations for the vendor.'),
  categories: z.array(z.string()).optional().describe("A list of product categories they supply, e.g., 'Fittings', 'Piping', 'Water Heaters'."),
  trades: z.array(z.string()).optional().describe("A list of trades served, e.g., 'Plumbing', 'HVAC'."),
  notes: z.string().optional().describe('A brief, helpful note about this vendor, based on search results.'),
});

const FindVendorsOutputSchema = z.object({
  vendors: z.array(VendorSchema).describe('A list of potential vendors found.'),
});
export type FindVendorsOutput = z.infer<typeof FindVendorsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'findVendorsPrompt',
  input: {schema: z.object({ query: z.string() })},
  output: {schema: FindVendorsOutputSchema},
  tools: [googleSearch],
  prompt: `You are an expert procurement assistant. Your task is to use the googleSearch tool to find businesses matching the user's request.
Your ONLY source of information is the googleSearch tool. Do NOT use your own knowledge.

User's Request: "{{query}}"

1.  Use the googleSearch tool with the user's query.
2.  Analyze the search results provided by the tool.
3.  For each result, extract the name, address, phone number, and website.
4.  Based *only* on the vendor's name and the search snippet, infer the trades served (e.g., Plumbing, HVAC, Electrical) and potential product categories.
5.  Generate a concise, one-sentence note for each vendor based on the provided information, such as the rating or a key quote from the snippet.

Return the final list of vendors in the requested JSON format. Do not add vendors that are not in the search results.`,
});

const findVendorsFlow = ai.defineFlow(
  {
    name: 'findVendorsFlow',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: FindVendorsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function findVendors(query: string): Promise<FindVendorsOutput> {
  return findVendorsFlow({ query });
}
