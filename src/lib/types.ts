

// This file contains the TypeScript types for your Firestore collections.

// A generic type for Firestore Timestamps. In Firestore, these are objects,
// but in the client, we'll often work with with JS Date objects. For simplicity,
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

export type TaxZone = {
    id: string;
    name: string;
    rate: number;
}

// Customer model from /customers/{customerId}
export type Customer = {
  id:string;
  primaryContact: { name: string; email: string; phone: string };
  companyInfo: { name: string; address: string };
  taxRegion?: string; // For tax jurisdiction
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
    taxCode?: string; // For item-specific tax rules
    inventoryParts?: EstimateLineItemPart[];
    origin?: {
      type: 'estimate' | 'change_order' | 'agreement' | 'job';
      id: string; // The ID of the source estimate/change order
      lineItemId?: string; // Optional: The specific ID of the line item in the source
    };
};

export type GbbTier = {
    good: string;
    better: string;
    best: string;
};

export type TaxLine = {
    name: string;
    rate?: number; // Optional rate, e.g., 0.08 for 8%
    amount: number;
}

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
    taxes: TaxLine[];
    total: number;
    notes?: string;
    gbbTier?: GbbTier | null;
    createdBy: string; // userId or technicianId
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
}


// ServiceAgreement model from /serviceAgreements/{agreementId}
export type ServiceAgreement = {
  id: string;
  title: string;
  customerId: string;
  customerName?: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  billingSchedule: {
    frequency: 'monthly' | 'quarterly' | 'annually';
    nextDueDate: Timestamp | Date;
  };
  autoInvoiceEnabled: boolean;
  startDate: Timestamp | Date;
  endDate?: Timestamp | Date;
  linkedJobIds: string[];
  amount: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Payment model from /payments/{paymentId} (or subcollection of invoices)
export type Payment = {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  date: Timestamp | Date;
  method: 'Credit Card' | 'Check' | 'Cash' | 'ACH' | 'Other';
  transactionId?: string;
  notes?: string;
  recordedBy: string; // userId
}

export type Commission = {
  technicianId: string;
  technicianName?: string;
  rate: number; // e.g., 0.10 for 10%
  amount: number;
}

export type Refund = {
    id: string;
    invoiceId: string;
    amount: number;
    date: Timestamp | Date;
    reason?: string;
    method: 'original_payment' | 'credit_memo';
    processedBy: string; // userId
}

export type PaymentPlanInstallment = {
    amount: number;
    dueDate: Timestamp | Date;
    status: 'pending' | 'paid' | 'overdue';
    paymentId?: string; // Link to the actual payment record when paid
};

export type PaymentPlan = {
    type: 'manual' | 'auto'; // 'auto' for future auto-pay features
    schedule: PaymentPlanInstallment[];
    totalAmount: number;
};

export type Deposit = {
    id: string;
    customerId: string;
    amount: number;
    status: 'available' | 'applied';
    createdAt: Timestamp | Date;
    appliedToInvoiceId?: string;
    originalInvoiceId?: string; // The invoice used to pay for the deposit
}

export type AuditLogEntry = {
    id: string;
    timestamp: Timestamp | Date;
    userId: string;
    userName: string;
    action: string;
    details?: string;
};


// Invoice model from /invoices/{invoiceId}
export type Invoice = {
  id: string;
  invoiceNumber: string;
  title: string;
  jobIds?: string[];
  customerId: string;
  status: 'draft' | 'pending_review' | 'sent' | 'paid' | 'overdue' | 'partially_paid' | 'refunded' | 'credited';
  lineItems: LineItem[];
  subtotal: number;
  taxes: TaxLine[];
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentTerms?: string;
  notes?: string;
  internalNotes?: string;
  stripePaymentLink?: string;
  dueDate: Timestamp | Date;
  issueDate: Timestamp | Date;
  createdAt: Timestamp | Date;
  commission?: Commission[];
  paymentPlan?: PaymentPlan;
  lateFeePolicy?: {
    enabled: boolean;
    lastApplied?: Timestamp | Date;
  };
  quickbooksSync?: {
      status: 'pending' | 'synced' | 'error';
      lastSync?: Timestamp | Date;
      error?: string;
  };
  xeroSync?: {
    status: 'pending' | 'synced' | 'error';
    lastSync?: Timestamp | Date;
    error?: string;
  };
  linkedEstimateIds?: string[];
  linkedChangeOrderIds?: string[];
  linkedServiceAgreementId?: string;
  auditLog?: AuditLogEntry[];
  // For UI enrichment
  customerName?: string;
  customer?: Customer;
  payments?: Payment[];
  refunds?: Refund[];
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
  id: string;
  jobId: string;
  customerId: string;
  title: string;
  description: string;
  lineItems: LineItem[];
  total: number;
  status: 'draft' | 'approved' | 'rejected' | 'invoiced';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  customerName?: string; // For UI enrichment
  jobTitle?: string; // For UI enrichment
}

// PurchaseOrder model from /purchaseOrders/{poId}
export interface PurchaseOrder {
  id: string;
  vendor: string;
  parts: { partId: string, qty: number, unitCost: number }[];
  status: 'draft' | 'ordered' | 'received' | 'delivered';
  destination: 'Warehouse' | string; // Warehouse or technicianId
  expectedDeliveryDate?: Timestamp | Date;
  orderDate: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
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
  vendor?: string;
  category: string;
  trade: 'Plumbing' | 'HVAC' | 'Electrical' | 'General';
  quantityOnHand: number;
  reorderThreshold: number;
  reorderQtyDefault: number;
  warehouseLocation: string; // ex: "Warehouse 1 - Bin B12"
  truckLocations: {
    technicianId: string;
    quantity: number;
  }[];
  unitCost: number;
  ourPrice: number;
  marketPrice?: number;
  images?: string[];
  linkedEstimateItems?: string[]; // References to estimate items using this part
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
  deposits: number;
}

export interface CustomerData {
  customer: Customer;
  equipment: Equipment[];
  jobs: (Job & { technicianName: string })[];
  estimates: Estimate[];
  deposits: Deposit[];
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
