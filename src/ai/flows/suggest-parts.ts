'use server';
/**
 * @fileOverview An AI agent for suggesting parts based on a description of the issue.
 *
 * - suggestParts - A function that handles the parts suggestion process.
 * - SuggestPartsInput - The input type for the suggestParts function.
 * - SuggestPartsOutput - The return type for the suggestParts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPartsInputSchema = z.object({
  issueDescription: z.string().describe('A description of the issue.'),
});
export type SuggestPartsInput = z.infer<typeof SuggestPartsInputSchema>;

const SuggestPartsOutputSchema = z.object({
  partsList: z.array(
    z.object({
      partName: z.string().describe('The name of the part.'),
      partNumber: z.string().describe('The part number.'),
      description: z.string().describe('A description of the part and its use.'),
    })
  ).describe('A list of suggested parts.'),
});
export type SuggestPartsOutput = z.infer<typeof SuggestPartsOutputSchema>;

export async function suggestParts(input: SuggestPartsInput): Promise<SuggestPartsOutput> {
  return suggestPartsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPartsPrompt',
  input: {schema: SuggestPartsInputSchema},
  output: {schema: SuggestPartsOutputSchema},
  prompt: `You are an expert technician. Based on the description of the issue, suggest a list of parts that may be needed to fix the issue.  Include the part name, part number, and a brief description of the part and its use.  Format your response as a JSON array of parts.

Issue Description: {{{issueDescription}}}`,
});

const suggestPartsFlow = ai.defineFlow(
  {
    name: 'suggestPartsFlow',
    inputSchema: SuggestPartsInputSchema,
    outputSchema: SuggestPartsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
