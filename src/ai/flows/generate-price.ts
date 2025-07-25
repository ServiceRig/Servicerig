'use server';
/**
 * @fileOverview An AI agent for generating a price estimate based on a job description.
 *
 * - generatePrice - A function that handles the price generation process.
 * - GeneratePriceInput - The input type for the generatePrice function.
 * - GeneratePriceOutput - The return type for the generatePrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaterialSchema = z.object({
    name: z.string().describe('The name of the material or part.'),
    quantity: z.number().describe('The estimated quantity needed for the job.'),
});

const GeneratePriceInputSchema = z.object({
  jobDescription: z.string().describe('A detailed description of the job, including location (e.g., attic, basement), complexity, and any specific customer requests.'),
});
export type GeneratePriceInput = z.infer<typeof GeneratePriceInputSchema>;

const GeneratePriceOutputSchema = z.object({
    recommendedTitle: z.string().describe('A concise, professional title for the job or service.'),
    serviceDescription: z.string().describe('A detailed, customer-facing description of the work to be performed.'),
    suggestedPrice: z.number().describe('A suggested retail price for the service, in USD. This should be a reasonable market rate.'),
    materials: z.array(MaterialSchema).describe('A list of necessary materials or parts for the job, including estimated quantities.'),
});
export type GeneratePriceOutput = z.infer<typeof GeneratePriceOutputSchema>;

export async function generatePrice(input: GeneratePriceInput): Promise<GeneratePriceOutput> {
  return generatePriceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePricePrompt',
  input: {schema: GeneratePriceInputSchema},
  output: {schema: GeneratePriceOutputSchema},
  prompt: `You are an expert estimator for a home services company (plumbing, HVAC, electrical). Based on the user's job description, you need to generate a comprehensive and fair market price estimate.

Analyze the following job description:
"{{{jobDescription}}}"

Based on the description, provide the following:
1.  **Recommended Title**: A clear and professional title for this service.
2.  **Service Description**: A customer-friendly paragraph explaining the scope of work.
3.  **Suggested Price**: A realistic, single dollar amount representing the total price for this service. Do not provide a range.
4.  **Materials**: A bulleted list of the primary materials that would be required to complete the job, including an estimated quantity for each material.

Return the response in the requested JSON format.`,
});

const generatePriceFlow = ai.defineFlow(
  {
    name: 'generatePriceFlow',
    inputSchema: GeneratePriceInputSchema,
    outputSchema: GeneratePriceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
