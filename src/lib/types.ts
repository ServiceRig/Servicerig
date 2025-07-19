
// This file contains the TypeScript types for your Firestore collections.

// A generic type for Firestore Timestamps. In Firestore, these are objects,
// but in the client, we'll often work with JS Date objects. For simplicity,
// we'll use the Date type directly in our mock data and client-side logic.
export type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

export enum UserRole {
  Admin = 'admin',
  Dispatcher = 'dispatcher',
  Technician = 'technician',
}

// User model from /users/{uid}
export interface User {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  teamId: string;
  avatarUrl?: string;
}

// This is a simplified Technician type for UI purposes, distinct from the main User type
export type Technician = {
  id: string;
  name: string;
  role: UserRole.Technician;
}

// Customer model from /customers/{customerId}
export type Customer = {
  id:string;
  primaryContact: { name: string; email: string; phone: string };
  companyInfo: { name: string; address: string };
  notes?: string;
  equipmentIds?: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
};


// Job model from /jobs/{jobId}
export type Job = {
  id: string;
  customerId: string;
  technicianId: string;
  status: 'unscheduled' | 'scheduled' | 'in_progress' | 'complete';
  schedule: {
    start: Date;
    end: Date;
  };
  duration: number;
  title: string;
  description: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  invoiceId?: string;
  agreementId?: string;
  tags?: string[];
  color?: string;
  isAutoCreated?: boolean;
  // For UI enrichment
  customerName?: string;
  technicianName?: string;
  details: {
    serviceType: string;
  };
};

export type InventoryPartRef = {
  partId: string;
  quantity: number;
}

export type EstimateLineItemPart = {
  partId: string;
  quantity: number;
  snapshot: {
    name: string;
    unitCost: number;
    ourPrice: number;
  }
}

export type LineItem = {
    description: string;
    quantity: number;
    unitPrice: number;
    inventoryParts?: EstimateLineItemPart[];
};

export type GbbTier = {
    good: string;
    better: string;
    best: string;
};

export type Estimate = {
    id: string;
    estimateNumber: string;
    title: string;
    customerId: string; // Reference to customer
    jobId?: string; // Optional reference to a job
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    lineItems: LineItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    notes?: string;
    gbbTier?: GbbTier | null;
    createdBy: string; // userId or technicianId
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
}


// ServiceAgreement model from /serviceAgreements/{agreementId}
export interface ServiceAgreement {
  customerId: string;
  recurringInterval: 'monthly' | 'quarterly' | 'annual' | 'one_time';
  startDate: Timestamp;
  endDate?: Timestamp;
  linkedJobIds: string[];
  billingAmount: number;
  billingFrequency: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Invoice model from /invoices/{invoiceId}
export type Invoice = {
  id: string;
  invoiceNumber: string;
  title: string;
  jobId?: string;
  customerId: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentTerms?: string;
  notes?: string;
  stripePaymentLink?: string;
  dueDate: Timestamp | Date;
  issueDate: Timestamp | Date;
  createdAt: Timestamp | Date;
  quickbooksSync?: {
      status: 'pending' | 'synced' | 'error';
      lastSync?: Timestamp | Date;
      error?: string;
  };
  linkedEstimateIds?: string[];
  linkedChangeOrderIds?: string[];
  linkedServiceAgreementId?: string;
  // For UI enrichment
  customerName?: string;
  job?: Job;
  customer?: Customer;
};


// Equipment model from /equipment/{equipmentId}
export type Equipment = {
  id: string;
  customerId: string;
  make: string;
  model: string;
  serial: string;
  notes: string;
  installedDate?: Timestamp | Date;
}

// Timecard model from /timecards/{userId}_{weekId}
export interface Timecard {
  entries: {
    clockIn: Timestamp;
    clockOut: Timestamp;
    jobId?: string;
  }[];
  weekStart: Timestamp;
  userId: string;
}

// GbbEstimate model from /gbbEstimates/{estimateId}
export interface GbbEstimate {
  customerId: string;
  jobId?: string;
  tiers: {
    good: string;
    better: string;
    best: string;
  };
  selectedTier?: 'good' | 'better' | 'best';
  aiTrained: boolean;
  createdAt: Timestamp;
}

// ChangeOrder model from /changeOrders/{changeOrderId}
export interface ChangeOrder {
  jobId: string;
  customerId: string;
  description: string;
  amountDelta: number;
  approved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// PurchaseOrder model from /purchaseOrders/{poId}
export interface PurchaseOrder {
  requestedBy: string;
  approvedBy?: string;
  vendor: string;
  items: {
    name: string;
    quantity: number;
    unitCost: number;
  }[];
  totalAmount: number;
  jobId?: string;
  status: 'requested' | 'approved' | 'ordered' | 'received';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Pricebook model from /pricebook/{itemId}
export type PricebookItem = {
  id: string;
  title: string;
  description: string;
  trade: 'Plumbing' | 'Electrical' | 'HVAC' | 'General';
  price: number; // Labor + Materials combined
  estimatedLaborHours?: number;
  inventoryParts?: InventoryPartRef[];
  isUrgent?: boolean;
  isCustom?: boolean;
  createdAt: Timestamp | Date;
}

// Inventory Item model from /inventoryItems/{itemId}
export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  sku: string;
  modelNumber?: string;
  partNumber?: string;
  warehouseLocation: string;
  quantityOnHand: number;
  reorderThreshold: number;
  unitCost: number;
  marketPrice: number;
  ourPrice: number;
  vendor?: string;
  trade: 'Plumbing' | 'Electrical' | 'HVAC' | 'General';
  createdAt: Timestamp | Date;
}


// Form model from /forms/{formId}
export interface Form {
  name: string;
  type: 'inspection' | 'safety' | 'custom';
  fields: unknown[]; // Field JSON schema
  linkedJobId?: string;
  submittedBy: string;
  submittedAt: Timestamp;
}

// Automation model from /automations/{automationId}
export interface Automation {
  trigger: string; // e.g. "invoice_paid"
  action: string; // e.g. "send_email"
  config: unknown;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Timesheet model from /timesheets/{userId}_{weekId}
export interface Timesheet {
  userId: string;
  weekStart: Timestamp;
  summary: {
    totalHours: number;
    overtimeHours: number;
    jobsWorked: number;
  };
  reviewed: boolean;
}

// --- Specific Page Data Shapes ---

export interface CustomerTotals {
  totalBilled: number;
  totalPaid: number;
  totalDirectExpenses: number;
}

export interface CustomerLinkedRecords {
  purchaseOrders: number;
  estimates: number;
  invoices: number;
  completedForms: number;
}

export interface CustomerData {
  customer: Customer;
  equipment: Equipment[];
  jobs: (Job & { technicianName: string })[];
  estimates: Estimate[];
  totals: CustomerTotals;
  linkedRecords: CustomerLinkedRecords;
}

export interface JobData {
    job: Job;
    customer: Customer;
    technician: Technician | null;
    estimates: Estimate[];
}

export interface EstimateData {
    estimate: Estimate;
    customer: Customer;
    job: Job | null;
}


// --- Template Types ---
export type EstimateTemplate = {
    id: string;
    title: string;
    lineItems: LineItem[];
    gbbTier?: GbbTier | null;
}
