'use server';
/**
 * @fileOverview An AI agent for finding and vetting potential vendors using a search tool.
 *
 * - findVendors - A function that handles the vendor discovery process.
 * - findVendorsAction - The server action wrapper for the UI.
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
    return {
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
  website: z.string().optional().describe('The vendor\'s website URL.'),
  locations: z.array(z.object({ address: z.string() })).describe('A list of known locations for the vendor.'),
  categories: z.array(z.string()).optional().describe("A list of product categories they supply, e.g., 'Fittings', 'Piping', 'Water Heaters'."),
  trades: z.array(z.string()).optional().describe("A list of trades served, e.g., 'Plumbing', 'HVAC'."),
  notes: z.string().optional().describe('A brief, helpful note about this vendor.'),
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
  prompt: `You are an expert procurement assistant for a home services company. Your task is to find the best local and national suppliers for a given trade. When asked, you should prioritize real-world, verifiable businesses over generic names. You should aim to include a mix of large national suppliers and well-regarded local specialists if the search results support it. If a user's query mentions a specific business name, ensure that business is included in the results if found.

User's Request: "{{query}}"

1.  First, use the googleSearch tool to find businesses matching the user's request.
2.  Analyze the search results. Prioritize businesses that are clearly wholesale suppliers for trades like plumbing, HVAC, or electrical.
3.  Pay close attention to the Google review ratings. Higher-rated vendors are preferred.
4.  From the search results, compile a list of the most relevant vendors. Extract their name, address, phone number, and website.
5.  Infer the trades served and potential product categories based on the vendor's name and search snippet.
6.  Generate a concise, one-sentence note for each vendor based on the provided information.

Return the final list of vendors in the requested JSON format.`,
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
