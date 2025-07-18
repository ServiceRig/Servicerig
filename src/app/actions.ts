
'use server';

import { generateTieredEstimates, type GenerateTieredEstimatesInput, type GenerateTieredEstimatesOutput } from "@/ai/flows/generate-tiered-estimates";
import { z } from "zod";
import { getEstimateById, addEstimate as addEstimateToDb } from "@/lib/firestore/estimates";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Estimate } from "@/lib/types";
import { addEstimateTemplate } from "@/lib/firestore/templates";

const tieredEstimatesSchema = z.object({
  jobDetails: z.string().min(10, "Job details must be at least 10 characters long."),
  customerHistory: z.string().min(10, "Customer history must be at least 10 characters long."),
});

type TieredEstimatesState = {
  message?: string | null;
  errors?: {
    jobDetails?: string[];
    customerHistory?: string[];
  } | null;
  data?: GenerateTieredEstimatesOutput | null;
}

export async function getTieredEstimates(
  prevState: TieredEstimatesState,
  formData: FormData
): Promise<TieredEstimatesState> {
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

const generateTiersSchema = z.object({
  jobDetails: z.string().min(10, { message: "Please provide more details about the job."}),
  customerHistory: z.string(),
});

export async function runGenerateTieredEstimates(prevState: any, formData: FormData) {
  const validatedFields = generateTiersSchema.safeParse({
    jobDetails: formData.get('jobDetails'),
    customerHistory: formData.get('customerHistory') || 'N/A',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateTieredEstimates(validatedFields.data);
    return { data: result };
  } catch (error) {
    console.error(error);
    return { message: "Failed to generate tiers. Please try again." };
  }
}

const addEstimateSchema = z.object({
    estimateData: z.string().transform(str => JSON.parse(str)),
});

export async function addEstimate(prevState: any, formData: FormData) {
    const validatedFields = addEstimateSchema.safeParse({
        estimateData: formData.get('estimateData'),
    });
    
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid estimate data provided.' };
    }

    try {
        const newEstimate: Omit<Estimate, 'id' | 'estimateNumber' | 'createdAt' | 'updatedAt'> = validatedFields.data.estimateData;
        
        const finalEstimate: Estimate = {
            id: `est_${Math.random().toString(36).substring(2, 9)}`,
            estimateNumber: `EST-${Math.floor(Math.random() * 9000) + 1000}`,
            ...newEstimate,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await addEstimateToDb(finalEstimate);
        revalidatePath('/dashboard/estimates');
        revalidatePath(`/dashboard/estimates/${finalEstimate.id}`);
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Failed to create estimate.' };
    }
    
    redirect('/dashboard/estimates');
}


export async function convertEstimateToInvoice(estimateId: string) {
    if (!estimateId) {
        throw new Error("Estimate ID is required.");
    }

    const estimate = await getEstimateById(estimateId);

    if (!estimate) {
        throw new Error("Estimate not found.");
    }
    
    if (estimate.status === 'rejected') {
        throw new Error("Cannot convert a rejected estimate.");
    }
    
    const newInvoiceId = `inv_${Math.random().toString(36).substring(2, 9)}`;
    const newInvoice = {
        id: newInvoiceId,
        invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
        customerId: estimate.customerId,
        jobId: estimate.jobId,
        linkedEstimateId: estimate.id,
        title: estimate.title,
        lineItems: estimate.lineItems,
        amount: estimate.total,
        status: 'draft' as const,
        issueDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Due in 30 days
        createdAt: new Date(),
    };

    // In a real app, you would save this to the 'invoices' collection in Firestore
    console.log(`Created new invoice ${newInvoiceId} from estimate ${estimateId}`);

    revalidatePath('/dashboard/invoices');
    revalidatePath(`/dashboard/estimates/${estimateId}`);

    redirect(`/dashboard/invoices/${newInvoiceId}`);
}

const updateStatusSchema = z.object({
  estimateId: z.string(),
  newStatus: z.enum(['draft', 'sent', 'accepted', 'rejected']),
});

export async function updateEstimateStatus(prevState: any, formData: FormData) {
  const validatedFields = updateStatusSchema.safeParse({
    estimateId: formData.get('estimateId'),
    newStatus: formData.get('newStatus'),
  });

  if (!validatedFields.success) {
    return { message: "Invalid data provided." };
  }
  
  const { estimateId, newStatus } = validatedFields.data;

  const estimate = await getEstimateById(estimateId);
  if (!estimate) {
    return { message: "Estimate not found." };
  }

  // In a real app, this would be an updateDoc call to Firestore
  estimate.status = newStatus;
  estimate.updatedAt = new Date();

  console.log(`Updated estimate ${estimateId} to status ${newStatus}`);
  
  revalidatePath(`/dashboard/estimates/${estimateId}`);
  revalidatePath('/dashboard/estimates');
  return { message: `Estimate status updated to ${newStatus}.` };
}

const createTemplateSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    lineItems: z.string().transform(str => JSON.parse(str)),
    gbbTier: z.string().optional().transform(str => str ? JSON.parse(str) : null),
});

export async function createEstimateTemplateAction(prevState: any, formData: FormData) {
    const validatedFields = createTemplateSchema.safeParse({
        title: formData.get('title'),
        lineItems: formData.get('lineItems'),
        gbbTier: formData.get('gbbTier'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed.',
        };
    }

    try {
        await addEstimateTemplate(validatedFields.data);
        revalidatePath('/dashboard/settings/estimates');
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Failed to create template.' };
    }
    
    // The redirect will be handled by the client
    return { success: true };
}
