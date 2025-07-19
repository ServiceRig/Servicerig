

'use server';

import { generateTieredEstimates, type GenerateTieredEstimatesInput, type GenerateTieredEstimatesOutput } from "@/ai/flows/generate-tiered-estimates";
import { z } from "zod";
import { getEstimateById, addEstimate as addEstimateToDb } from "@/lib/firestore/estimates";
import { addJob } from "@/lib/firestore/jobs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Estimate, GbbTier, LineItem, PricebookItem, Job } from "@/lib/types";
import { addEstimateTemplate } from "@/lib/firestore/templates";
import { mockData } from "@/lib/mock-data";
import { addPricebookItem } from "@/lib/firestore/pricebook";

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
  } catch (error) {
    console.error(error);
    return { message: 'An error occurred while generating estimates.' };
  }
}

const generateTiersSchema = z.object({
  jobDetails: z.string().min(10, { message: "Please provide more details about the job."}),
  customerHistory: z.string(),
});

type GenerateTiersState = {
    data?: GenerateTieredEstimatesOutput | null;
    errors?: {
        jobDetails?: string[];
    } | null;
    message?: string | null;
}

export async function runGenerateTieredEstimates(prevState: GenerateTiersState, formData: FormData): Promise<GenerateTiersState> {
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

const lineItemSchema = z.object({
    description: z.string(),
    quantity: z.coerce.number(),
    unitPrice: z.coerce.number(),
    inventoryParts: z.array(z.any()).optional(),
});

const addEstimateSchema = z.object({
    customerId: z.string().min(1, { message: 'Customer is required.' }),
    title: z.string().min(1, { message: 'Title is required.' }),
    jobId: z.string().optional().transform(val => val === '' ? undefined : val),
    lineItems: z.string().transform((val, ctx) => {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
                return z.array(lineItemSchema).parse(parsed);
            }
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Line items must be an array."});
            return z.NEVER;
        } catch(e) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON for line items."});
            return z.NEVER;
        }
    }),
    gbbTier: z.string().nullable().transform((val, ctx) => {
         if (val === null || val === 'null' || val === '') {
            return null;
        }
        try {
            const parsed = JSON.parse(val);
            if (typeof parsed === 'object' && parsed !== null && 'good' in parsed && 'better' in parsed && 'best' in parsed) {
                return parsed as GbbTier;
            }
            return null;
        } catch {
            return null; // Be lenient, if it's not valid JSON, treat as null
        }
    }),
});

type AddEstimateState = {
    success: boolean;
    message: string | null;
}

export async function addEstimate(prevState: AddEstimateState, formData: FormData): Promise<AddEstimateState> {
    let newEstimateId = '';
    try {
        const validatedFields = addEstimateSchema.safeParse({
            customerId: formData.get('customerId'),
            title: formData.get('title'),
            jobId: formData.get('jobId'),
            lineItems: formData.get('lineItems'),
            gbbTier: formData.get('gbbTier'),
        });
        
        if (!validatedFields.success) {
            console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
            return { success: false, message: 'Invalid estimate data provided.' };
        }

        let { customerId, title, jobId, lineItems, gbbTier } = validatedFields.data;
        
        const customer = mockData.customers.find(c => c.id === customerId);
        if (!customer) {
            return { success: false, message: 'Customer not found.' };
        }

        if (!jobId) {
            console.log("No Job ID provided, creating a new job.");
            const newJobId = `job_${Math.random().toString(36).substring(2, 9)}`;
            const newJob: Job = {
                id: newJobId,
                customerId,
                title: `Job for: ${title}`,
                description: `This job was auto-created from estimate for "${title}".`,
                status: 'unscheduled',
                technicianId: '',
                schedule: { start: new Date(), end: new Date() },
                duration: 0,
                details: { serviceType: 'Unspecified' },
                isAutoCreated: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await addJob(newJob);
            jobId = newJobId;
            console.log(`Auto-created new job with ID: ${jobId}`);
        }
        
        const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const discount = 0;
        const tax = subtotal * 0.08;
        const total = subtotal - discount + tax;
        
        newEstimateId = `est_${Math.random().toString(36).substring(2, 9)}`;

        const finalEstimate: Estimate = {
            id: newEstimateId,
            estimateNumber: `EST-${Math.floor(Math.random() * 9000) + 1000}`,
            customerId,
            title,
            status: 'draft', 
            jobId: jobId || undefined,
            lineItems,
            subtotal,
            discount,
            tax,
            total,
            gbbTier,
            createdBy: 'admin_user', 
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await addEstimateToDb(finalEstimate);
        revalidatePath('/dashboard/estimates');
        revalidatePath(`/dashboard/estimates/${finalEstimate.id}`);
        if (jobId) {
            revalidatePath(`/dashboard/jobs/${jobId}`);
        }

    } catch (error) {
        console.error("Error in addEstimate action:", error);
        return { success: false, message: 'Failed to create estimate.' };
    }
    
    redirect(`/dashboard/estimates/${newEstimateId}`);
}

const acceptEstimateSchema = z.object({
  customerId: z.string().min(1),
  jobId: z.string().optional(),
  title: z.string().min(1),
  selectedTier: z.string(), // This will be JSON string
});


export async function acceptEstimateFromTiers(formData: FormData) {
    let newEstimateId = '';
    try {
        const validatedFields = acceptEstimateSchema.safeParse({
            customerId: formData.get('customerId'),
            jobId: formData.get('jobId'),
            title: formData.get('title'),
            selectedTier: formData.get('selectedTier'),
        });

        if (!validatedFields.success) {
            console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
            throw new Error('Invalid estimate data provided.');
        }

        const { customerId, title, jobId } = validatedFields.data;
        const selectedTier = JSON.parse(validatedFields.data.selectedTier) as { description: string, price: number };

        const customer = mockData.customers.find(c => c.id === customerId);
        if (!customer) {
            throw new Error('Customer not found.');
        }

        const lineItems: LineItem[] = [{
            description: selectedTier.description,
            quantity: 1,
            unitPrice: selectedTier.price || 0,
            inventoryParts: [],
        }];

        const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const discount = 0;
        const tax = subtotal * 0.08; // Example 8% tax
        const total = subtotal - discount + tax;
        
        newEstimateId = `est_${Math.random().toString(36).substring(2, 9)}`;

        const finalEstimate: Estimate = {
            id: newEstimateId,
            estimateNumber: `EST-${Math.floor(Math.random() * 9000) + 1000}`,
            customerId,
            title,
            status: 'accepted',
            jobId: jobId || undefined,
            lineItems,
            subtotal,
            discount,
            tax,
            total,
            createdBy: 'customer_acceptance',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await addEstimateToDb(finalEstimate);
        revalidatePath('/dashboard/estimates');
        revalidatePath(`/dashboard/estimates/${finalEstimate.id}`);
    } catch (error) {
        console.error("Error in acceptEstimateFromTiers action:", error);
        throw error;
    }
    
    redirect(`/dashboard/estimates/${newEstimateId}`);
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
    
    console.log(`Created new invoice ${newInvoiceId} from estimate ${estimateId}`);

    revalidatePath('/dashboard/invoices');
    revalidatePath(`/dashboard/estimates/${estimateId}`);

    redirect(`/dashboard/invoices/${newInvoiceId}`);
}

const updateStatusSchema = z.object({
  estimateId: z.string(),
  newStatus: z.enum(['draft', 'sent', 'accepted', 'rejected']),
});

type UpdateStatusState = {
    message: string | null;
}

export async function updateEstimateStatus(prevState: UpdateStatusState, formData: FormData): Promise<UpdateStatusState> {
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

  estimate.status = newStatus;
  estimate.updatedAt = new Date();

  console.log(`Updated estimate ${estimateId} to status ${newStatus}`);
  
  revalidatePath(`/dashboard/estimates/${estimateId}`);
  revalidatePath('/dashboard/estimates');
  return { message: `Estimate status updated to ${newStatus}.` };
}

const createTemplateSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    lineItems: z.string().transform(val => JSON.parse(val)),
    gbbTier: z.string().optional().transform(str => str ? JSON.parse(str) : null),
});

type CreateTemplateState = {
    success: boolean;
    message?: string | null;
    errors?: {
        title?: string[];
        lineItems?: string[];
        gbbTier?: string[];
    } | null;
}

export async function createEstimateTemplateAction(prevState: CreateTemplateState, formData: FormData): Promise<CreateTemplateState> {
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
    
    return { success: true, message: 'Template created successfully.' };
}


const addPricebookItemSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string(),
    price: z.number().min(0, { message: 'Price cannot be negative' }),
    trade: z.enum(['Plumbing', 'HVAC', 'Electrical', 'General']),
});

type AddPricebookItemState = {
    success: boolean;
    message: string;
}

export async function addPricebookItemAction(prevState: AddPricebookItemState, formData: FormData): Promise<AddPricebookItemState> {
    const validatedFields = addPricebookItemSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
        trade: formData.get('trade'),
    });
    
    if (!validatedFields.success) {
        console.error(validatedFields.error);
        return { success: false, message: 'Invalid data provided.' };
    }
    
    try {
        const newItem: Omit<PricebookItem, 'id' | 'createdAt' | 'inventoryParts'> = {
            ...validatedFields.data,
            isCustom: true,
        };
        await addPricebookItem({ ...newItem, inventoryParts: [] }); // AI items have no parts by default
        revalidatePath('/dashboard/price-book');
        return { success: true, message: `Successfully added "${validatedFields.data.title}" to the price book.`};
    } catch(e) {
        console.error(e);
        return { success: false, message: 'Failed to add item to price book.' };
    }
}
