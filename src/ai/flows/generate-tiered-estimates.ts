// use server'
'use server';

/**
 * @fileOverview AI-powered tiered estimate generation (Good/Better/Best) for creating tailored proposals.
 *
 * - generateTieredEstimates - A function that handles the estimate generation process.
 * - GenerateTieredEstimatesInput - The input type for the generateTieredEstimates function.
 * - GenerateTieredEstimatesOutput - The return type for the generateTieredEstimates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTieredEstimatesInputSchema = z.object({
  jobDetails: z.string().describe('Details of the job including tasks, scope, and requirements.'),
  customerHistory: z.string().describe('A summary of the customer history including past services, preferences, and payment behavior.'),
});
export type GenerateTieredEstimatesInput = z.infer<typeof GenerateTieredEstimatesInputSchema>;

const GenerateTieredEstimatesOutputSchema = z.object({
  goodEstimate: z.string().describe('A basic estimate outlining essential services at a minimal cost.'),
  betterEstimate: z.string().describe('A comprehensive estimate including additional services and features at a moderate cost.'),
  bestEstimate: z.string().describe('A premium estimate offering top-tier services, enhanced features, and extended support at a higher cost.'),
});
export type GenerateTieredEstimatesOutput = z.infer<typeof GenerateTieredEstimatesOutputSchema>;

export async function generateTieredEstimates(input: GenerateTieredEstimatesInput): Promise<GenerateTieredEstimatesOutput> {
  return generateTieredEstimatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTieredEstimatesPrompt',
  input: {schema: GenerateTieredEstimatesInputSchema},
  output: {schema: GenerateTieredEstimatesOutputSchema},
  prompt: `You are an AI assistant specialized in generating tiered service estimates (Good, Better, Best) for service businesses. Based on the provided job details and customer history, create three distinct estimates offering different levels of service and value.

Job Details: {{{jobDetails}}}
Customer History: {{{customerHistory}}}

Generate a 'Good' estimate focusing on the essential services at the lowest possible price. Then, create a 'Better' estimate including additional services and features at a moderate price. Finally, develop a 'Best' estimate offering premium services, enhanced features, and extended support at a higher price. Each estimate should be a comprehensive paragraph.

Output should follow this format:
Good Estimate: [Generated Good Estimate]
Better Estimate: [Generated Better Estimate]
Best Estimate: [Generated Best Estimate]`,
});

const generateTieredEstimatesFlow = ai.defineFlow(
  {
    name: 'generateTieredEstimatesFlow',
    inputSchema: GenerateTieredEstimatesInputSchema,
    outputSchema: GenerateTieredEstimatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
