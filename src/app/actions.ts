'use server';

import { generateTieredEstimates, type GenerateTieredEstimatesInput } from "@/ai/flows/generate-tiered-estimates";
import { z } from "zod";

const tieredEstimatesSchema = z.object({
  jobDetails: z.string().min(10, "Job details must be at least 10 characters long."),
  customerHistory: z.string().min(10, "Customer history must be at least 10 characters long."),
});

type State = {
  message?: string | null;
  errors?: {
    jobDetails?: string[];
    customerHistory?: string[];
  } | null;
  data?: {
    goodEstimate: string;
    betterEstimate: string;
    bestEstimate: string;
  } | null;
}

export async function getTieredEstimates(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = tieredEstimatesSchema.safeParse({
    jobDetails: formData.get('jobDetails'),
    customerHistory: formData.get('customerHistory'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your inputs.',
    }
  }

  try {
    const input: GenerateTieredEstimatesInput = validatedFields.data;
    const result = await generateTieredEstimates(input);
    return { message: 'Estimates generated successfully.', data: result };
  } catch (e) {
    return { message: 'An error occurred while generating estimates.' };
  }
}
