'use server';
/**
 * @fileOverview An AI agent for analyzing an invoice for accuracy against job and estimate details.
 *
 * - analyzeInvoice - A function that handles the invoice analysis process.
 * - AnalyzeInvoiceInput - The input type for the analyzeInvoice function.
 * - AnalyzeInvoiceOutput - The return type for the analyzeInvoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInvoiceInputSchema = z.object({
  jobDetails: z.string().describe('A detailed description of the job that was performed, including scope and tasks.'),
  estimateDetails: z.string().describe('The details from the original estimate, including line items and total. Can be "N/A" if no estimate exists.'),
  invoiceDetails: z.string().describe('The details of the invoice being analyzed, including line items and total.'),
});
export type AnalyzeInvoiceInput = z.infer<typeof AnalyzeInvoiceInputSchema>;

const AnomalySchema = z.object({
    type: z.enum(['MissingItem', 'PriceMismatch', 'ScopeMismatch', 'UnusualItem', 'LaborMismatch']).describe('The type of anomaly found.'),
    description: z.string().describe('A clear, concise description of the anomaly or potential issue.'),
});

const AnalyzeInvoiceOutputSchema = z.object({
  isConsistent: z.boolean().describe('A boolean indicating if the invoice appears consistent with the provided details. This should be false if any significant anomalies are found.'),
  analysisSummary: z.string().describe('A one-sentence summary of the overall analysis findings.'),
  anomalies: z.array(AnomalySchema).describe('A list of specific discrepancies or potential issues found between the invoice, job details, and estimate.'),
});
export type AnalyzeInvoiceOutput = z.infer<typeof AnalyzeInvoiceOutputSchema>;


export async function analyzeInvoice(input: AnalyzeInvoiceInput): Promise<AnalyzeInvoiceOutput> {
  return analyzeInvoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInvoicePrompt',
  input: {schema: AnalyzeInvoiceInputSchema},
  output: {schema: AnalyzeInvoiceOutputSchema},
  prompt: `You are an expert auditor for a home services company. Your task is to analyze an invoice for accuracy and consistency against the original job scope and estimate.

Here is the data you need to analyze:

1.  **Job Details:**
    \`\`\`
    {{{jobDetails}}}
    \`\`\`

2.  **Estimate Details:**
    \`\`\`
    {{{estimateDetails}}}
    \`\`\`

3.  **Final Invoice Details:**
    \`\`\`
    {{{invoiceDetails}}}
    \`\`\`

**Your Task:**
Carefully compare the final invoice to the job details and the estimate. Identify any discrepancies, such as:
-   Items on the invoice that were not mentioned in the job or estimate.
-   Significant price differences between the estimate and the final invoice for similar items.
-   Work described on the invoice that seems outside the original job scope.
-   Any unusual or potentially incorrect charges.

Based on your analysis, determine if the invoice is consistent. Provide a concise summary and a list of any anomalies you find. If there are no anomalies, return an empty array for the anomalies field.`,
});

const analyzeInvoiceFlow = ai.defineFlow(
  {
    name: 'analyzeInvoiceFlow',
    inputSchema: AnalyzeInvoiceInputSchema,
    outputSchema: AnalyzeInvoiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);