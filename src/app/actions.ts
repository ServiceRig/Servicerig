'use server';

import { generateTieredEstimates, type GenerateTieredEstimatesInput, type GenerateTieredEstimatesOutput } from "@/ai/flows/generate-tiered-estimates";
import { z } from "zod";
import { getEstimateById } from "@/lib/firestore/estimates";
import { mockInvoices } from "@/lib/mock-data";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Estimate, EstimateTemplate } from "@/lib/types";
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


export async function convertEstimateToInvoice(estimateId: string) {
    if (!estimateId) {
        throw new Error("Estimate ID is required.");
    }

    // In a real app, you'd fetch from Firestore
    const estimate = await getEstimateById(estimateId);

    if (!estimate) {
        throw new Error("Estimate not found.");
    }
    
    if (estimate.status === 'rejected') {
        throw new Error("Cannot convert a rejected estimate.");
    }
    
    // In a real app, you would use addDoc to create a new invoice in Firestore.
    // Here, we simulate it by creating a new object and pushing it to our mock data array.
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

    mockInvoices.push(newInvoice);
    console.log(`Created new invoice ${newInvoiceId} from estimate ${estimateId}`);

    // Revalidate paths to ensure UI updates if user navigates back.
    revalidatePath('/dashboard/invoices');
    revalidatePath(`/dashboard/estimates/${estimateId}`);

    // Redirect to the newly created invoice's detail page.
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

  // In a real app, you'd use updateDoc here.
  const estimateIndex = mockEstimates.findIndex(e => e.id === estimateId);
  if (estimateIndex === -1) {
    return { message: "Estimate not found." };
  }

  mockEstimates[estimateIndex].status = newStatus;
  mockEstimates[estimateIndex].updatedAt = new Date();

  console.log(`Updated estimate ${estimateId} to status ${newStatus}`);
  
  revalidatePath(`/dashboard/estimates/${estimateId}`);
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
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed.',
        };
    }

    try {
        await addEstimateTemplate(validatedFields.data);
        revalidatePath('/dashboard/settings/estimates');
        redirect('/dashboard/settings/estimates');
    } catch (error) {
        console.error(error);
        return { message: 'Failed to create template.' };
    }
}
