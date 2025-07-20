
'use server';

import { generateTieredEstimates, type GenerateTieredEstimatesInput, type GenerateTieredEstimatesOutput } from "@/ai/flows/generate-tiered-estimates";
import { z } from "zod";
import { addEstimate as addEstimateToDb, getEstimateById, updateEstimate as updateEstimateInDb } from "@/lib/firestore/estimates";
import { addJob as addJobToDb, getJobById, updateJob } from "@/lib/firestore/jobs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Estimate, GbbTier, LineItem, PricebookItem, Job, Invoice } from "@/lib/types";
import { addEstimateTemplate } from "@/lib/firestore/templates";
import { mockData } from "@/lib/mock-data";
import { addPricebookItem } from "@/lib/firestore/pricebook";
import { getCustomerById } from "@/lib/firestore/customers";
import { analyzeInvoice } from "@/ai/flows/analyze-invoice";
import { addInvoice as addInvoiceToDb, updateInvoice as updateInvoiceInDb } from "@/lib/firestore/invoices";

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
    role: z.string().optional(),
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
    gbbTier: z.string().nullable().transform((val) => {
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
    let newEstimate: Estimate;
    let role = '';
    try {
        const validatedFields = addEstimateSchema.safeParse({
            customerId: formData.get('customerId'),
            title: formData.get('title'),
            jobId: formData.get('jobId'),
            lineItems: formData.get('lineItems'),
            gbbTier: formData.get('gbbTier'),
            role: formData.get('role'),
        });
        
        if (!validatedFields.success) {
            console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
            return { success: false, message: 'Invalid estimate data provided.' };
        }

        let { customerId, title, jobId, lineItems, gbbTier } = validatedFields.data;
        role = validatedFields.data.role || '';
        
        const customer = await getCustomerById(customerId);
        if (!customer) {
            return { success: false, message: 'Customer not found.' };
        }

        if (!jobId) {
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
            await addJobToDb(newJob);
            jobId = newJobId;
            console.log(`Auto-created new job with ID: ${jobId}`);
        }
        
        const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const discount = 0;

        // Find the tax rate for the customer's region
        const taxZone = mockData.taxZones.find(zone => zone.id === customer.taxRegion);
        const taxRate = taxZone ? taxZone.rate : 0; // Default to 0 if no zone found
        const tax = subtotal * taxRate;
        
        const total = subtotal - discount + tax;
        
        const newEstimateId = `est_${Math.random().toString(36).substring(2, 9)}`;

        newEstimate = {
            id: newEstimateId,
            estimateNumber: `EST-${Math.floor(Math.random() * 9000) + 1000}`,
            customerId,
            title,
            status: 'draft', 
            jobId: jobId || undefined,
            lineItems,
            subtotal,
            discount,
            taxes: [{ name: taxZone ? `${taxZone.name} Tax` : 'Tax', amount: tax, rate: taxRate }],
            total,
            gbbTier,
            createdBy: 'admin_user', 
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await addEstimateToDb(newEstimate);

    } catch (error) {
        console.error("Error in addEstimate action:", error);
        return { success: false, message: 'Failed to create estimate.' };
    }
    
    revalidatePath('/dashboard/estimates');
    const newEstimateData = encodeURIComponent(JSON.stringify(newEstimate));
    redirect(`/dashboard/estimates/${newEstimate.id}?role=${role}&newEstimateData=${newEstimateData}`);
}

const addInvoiceSchema = z.object({
    customerId: z.string().min(1, { message: 'Customer is required.' }),
    title: z.string().min(1, { message: 'Title is required.' }),
    jobIds: z.string().transform((val, ctx) => {
        try {
            const parsed = JSON.parse(val);
            return z.array(z.string()).parse(parsed);
        } catch {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Job IDs."});
            return z.NEVER;
        }
    }),
    lineItems: z.string().transform((val, ctx) => {
        try {
            const parsed = JSON.parse(val);
            return z.array(lineItemSchema).parse(parsed);
        } catch {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid line items."});
            return z.NEVER;
        }
    }),
    role: z.string().optional(),
});

type AddInvoiceState = {
    success: boolean;
    message: string | null;
}

export async function addInvoice(prevState: AddInvoiceState, formData: FormData): Promise<AddInvoiceState> {
    let newInvoice: Invoice;
    let role = '';

    try {
        const validatedFields = addInvoiceSchema.safeParse({
            customerId: formData.get('customerId'),
            title: formData.get('title'),
            jobIds: formData.get('jobIds'),
            lineItems: formData.get('lineItems'),
            role: formData.get('role'),
        });
        
        if (!validatedFields.success) {
            console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
            return { success: false, message: 'Invalid invoice data provided.' };
        }
        
        const { customerId, title, jobIds, lineItems } = validatedFields.data;
        role = validatedFields.data.role || '';
        
        const customer = await getCustomerById(customerId);
        if (!customer) {
            return { success: false, message: 'Customer not found.' };
        }

        const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const taxZone = mockData.taxZones.find(zone => zone.id === customer.taxRegion);
        const taxRate = taxZone ? taxZone.rate : 0;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        
        const newInvoiceId = `inv_${Math.random().toString(36).substring(2, 9)}`;
        newInvoice = {
            id: newInvoiceId,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            customerId,
            title,
            jobIds,
            status: 'draft',
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
            lineItems,
            subtotal,
            taxes: [{ name: taxZone ? `${taxZone.name} Tax` : 'Tax', amount: tax, rate: taxRate }],
            total,
            amountPaid: 0,
            balanceDue: total,
            paymentTerms: 'Net 30',
            createdAt: new Date(),
        };

        await addInvoiceToDb(newInvoice);

        // Update the jobs with the new invoice ID
        for (const jobId of jobIds) {
            const job = await getJobById(jobId);
            if (job) {
                job.invoiceId = newInvoiceId;
                await updateJob(job);
            }
        }

    } catch (error) {
        console.error("Error in addInvoice action:", error);
        return { success: false, message: 'Failed to create invoice.' };
    }
    
    revalidatePath('/dashboard/invoices');
    const newInvoiceData = encodeURIComponent(JSON.stringify(newInvoice));
    redirect(`/dashboard/invoices/${newInvoice.id}?role=${role}&newInvoiceData=${newInvoiceData}`);
}


const acceptEstimateSchema = z.object({
  customerId: z.string().min(1),
  jobId: z.string().optional(),
  title: z.string().min(1),
  role: z.string().optional(),
  selectedTier: z.string(), // This will be JSON string
});


export async function acceptEstimateFromTiers(formData: FormData) {
    let newEstimate: Estimate;
    let role = '';
    try {
        const validatedFields = acceptEstimateSchema.safeParse({
            customerId: formData.get('customerId'),
            jobId: formData.get('jobId'),
            title: formData.get('title'),
            role: formData.get('role'),
            selectedTier: formData.get('selectedTier'),
        });

        if (!validatedFields.success) {
            console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
            throw new Error('Invalid estimate data provided.');
        }

        const { customerId, title, jobId } = validatedFields.data;
        const selectedTier = JSON.parse(validatedFields.data.selectedTier) as { description: string, price: number };
        role = validatedFields.data.role || '';

        const customer = await getCustomerById(customerId);
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
        
        const taxZone = mockData.taxZones.find(zone => zone.id === customer.taxRegion);
        const taxRate = taxZone ? taxZone.rate : 0;
        const tax = subtotal * taxRate;
        const total = subtotal - discount + tax;
        
        const newEstimateId = `est_${Math.random().toString(36).substring(2, 9)}`;

        newEstimate = {
            id: newEstimateId,
            estimateNumber: `EST-${Math.floor(Math.random() * 9000) + 1000}`,
            customerId,
            title,
            status: 'accepted',
            jobId: jobId || undefined,
            lineItems,
            subtotal,
            discount,
            taxes: [{ name: taxZone ? `${taxZone.name} Tax` : 'Tax', amount: tax, rate: taxRate }],
            total,
            createdBy: 'customer_acceptance',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await addEstimateToDb(newEstimate);
        revalidatePath('/dashboard/estimates');
        revalidatePath(`/dashboard/estimates/${newEstimate.id}`);
    } catch (error) {
        console.error("Error in acceptEstimateFromTiers action:", error);
        throw error;
    }
    
    const newEstimateData = encodeURIComponent(JSON.stringify(newEstimate));
    redirect(`/dashboard/estimates?role=${role}&newEstimateData=${newEstimateData}`);
}

export async function convertEstimateToInvoice(formData: FormData) {
    const estimateId = formData.get('estimateId') as string;
    const role = formData.get('role') as string;

    if (!estimateId) {
        throw new Error("Estimate ID is required.");
    }

    const estimate = await getEstimateById(estimateId);

    if (!estimate) {
        throw new Error("Estimate not found.");
    }
    
    if (estimate.status !== 'accepted') {
        throw new Error("Cannot convert an estimate that is not accepted.");
    }
    
    const newInvoiceId = `inv_${Math.random().toString(36).substring(2, 9)}`;
    const newInvoice: Invoice = {
        id: newInvoiceId,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        customerId: estimate.customerId,
        jobIds: estimate.jobId ? [estimate.jobId] : [],
        title: estimate.title,
        status: 'draft',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
        lineItems: estimate.lineItems.map(item => ({ ...item, origin: { type: 'estimate', id: estimateId } })),
        subtotal: estimate.subtotal,
        taxes: estimate.taxes,
        total: estimate.total,
        amountPaid: 0,
        balanceDue: estimate.total,
        paymentTerms: 'Net 30',
        createdAt: new Date(),
        linkedEstimateIds: [estimateId],
    };

    await addInvoiceToDb(newInvoice);

    revalidatePath('/dashboard/invoices');
    revalidatePath(`/dashboard/estimates/${estimateId}`);

    const newInvoiceData = encodeURIComponent(JSON.stringify(newInvoice));
    redirect(`/dashboard/invoices/${newInvoice.id}?role=${role}&newInvoiceData=${newInvoiceData}`);
}


const updateStatusSchema = z.object({
  estimateId: z.string(),
  newStatus: z.enum(['draft', 'sent', 'accepted', 'rejected']),
});

type UpdateStatusState = {
    message: string | null;
    data?: Estimate | null;
    error?: string | null;
}

export async function updateEstimateStatus(prevState: UpdateStatusState, formData: FormData): Promise<UpdateStatusState> {
  const validatedFields = updateStatusSchema.safeParse({
    estimateId: formData.get('estimateId'),
    newStatus: formData.get('newStatus'),
  });

  if (!validatedFields.success) {
    return { message: "Invalid data provided.", error: "Invalid data" };
  }
  
  const { estimateId, newStatus } = validatedFields.data;

  try {
    const estimate = await getEstimateById(estimateId);
    if (!estimate) {
      return { message: "Estimate not found.", error: "Not Found" };
    }

    estimate.status = newStatus;
    estimate.updatedAt = new Date();
    await updateEstimateInDb(estimate);
    
    // Re-fetch to ensure we have the latest data, although updateEstimate modifies in place for mocks
    const updatedEstimate = await getEstimateById(estimateId);
    
    revalidatePath(`/dashboard/estimates/${estimateId}`);
    revalidatePath('/dashboard/estimates');
    return { message: `Estimate status updated to ${newStatus}.`, data: updatedEstimate };
  } catch (e: any) {
    return { message: "Failed to update status.", error: e.message };
  }
}

const acceptEstimateWithSignatureSchema = z.object({
    estimateId: z.string(),
    signature: z.string().optional(), // Assuming signature might be a data URL or similar
});

export async function acceptEstimateWithSignature(formData: FormData) {
    const validatedFields = acceptEstimateWithSignatureSchema.safeParse({
        estimateId: formData.get('estimateId'),
        signature: formData.get('signature'),
    });

    if (!validatedFields.success) {
        throw new Error("Invalid data for acceptance.");
    }

    const { estimateId } = validatedFields.data;
    
    const estimate = await getEstimateById(estimateId);
    if (!estimate) {
        throw new Error("Estimate not found.");
    }

    if (estimate.status !== 'sent') {
        throw new Error("Only sent estimates can be accepted.");
    }
    
    estimate.status = 'accepted';
    estimate.updatedAt = new Date();
    
    await updateEstimateInDb(estimate);

    revalidatePath(`/dashboard/estimates/${estimateId}`);
    revalidatePath('/dashboard/estimates');
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


type AnalyzeInvoiceState = {
  data?: any | null;
  error?: string | null;
}

export async function analyzeInvoiceAction(prevState: AnalyzeInvoiceState, formData: FormData): Promise<AnalyzeInvoiceState> {
  const jobDetails = formData.get('jobDetails') as string;
  const estimateDetails = formData.get('estimateDetails') as string;
  const invoiceDetails = formData.get('invoiceDetails') as string;

  if (!jobDetails || !estimateDetails || !invoiceDetails) {
    return { error: 'Missing required details for analysis.' };
  }

  try {
    const result = await analyzeInvoice({ jobDetails, estimateDetails, invoiceDetails });
    return { data: result };
  } catch (error) {
    console.error('Error analyzing invoice:', error);
    return { error: 'An unexpected error occurred during analysis.' };
  }
}

const updateInvoiceSchema = z.object({
    invoiceId: z.string(),
    title: z.string().min(1, { message: 'Title is required.' }),
    lineItems: z.string().transform((val, ctx) => {
        try {
            return z.array(lineItemSchema).parse(JSON.parse(val));
        } catch {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid line items."});
            return z.NEVER;
        }
    }),
});

type UpdateInvoiceState = {
    success: boolean;
    message: string | null;
    errors?: any;
}

export async function updateInvoice(prevState: UpdateInvoiceState, formData: FormData): Promise<UpdateInvoiceState> {
    const validatedFields = updateInvoiceSchema.safeParse({
        invoiceId: formData.get('invoiceId'),
        title: formData.get('title'),
        lineItems: formData.get('lineItems'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed.",
            errors: validatedFields.error.flatten().fieldErrors
        };
    }

    try {
        const { invoiceId, title, lineItems } = validatedFields.data;
        const existingInvoice = mockData.invoices.find(inv => inv.id === invoiceId);

        if (!existingInvoice) {
            return { success: false, message: "Invoice not found." };
        }
        
        if (existingInvoice.status !== 'draft') {
            return { success: false, message: "Only draft invoices can be edited." };
        }

        const customer = await getCustomerById(existingInvoice.customerId);
        if (!customer) {
            return { success: false, message: "Associated customer not found." };
        }

        const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const taxZone = mockData.taxZones.find(zone => zone.id === customer.taxRegion);
        const taxRate = taxZone ? taxZone.rate : 0;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        const updatedInvoice: Invoice = {
            ...existingInvoice,
            title,
            lineItems,
            subtotal,
            taxes: [{ name: taxZone ? `${taxZone.name} Tax` : 'Tax', amount: tax, rate: taxRate }],
            total,
            balanceDue: total - existingInvoice.amountPaid,
            updatedAt: new Date(),
        };

        await updateInvoiceInDb(updatedInvoice);
        revalidatePath(`/dashboard/invoices/${invoiceId}`);
        revalidatePath('/dashboard/invoices');

    } catch (error) {
        console.error("Error updating invoice:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
    
    const role = formData.get('role') as string;
    redirect(`/dashboard/invoices/${validatedFields.data.invoiceId}?role=${role}`);
}
