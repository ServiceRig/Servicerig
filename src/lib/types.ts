
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
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  teamId?: string;
  avatarUrl?: string;
}

export type VendorLocation = {
    address: string;
    coordinates?: { lat: number; lng: number };
    region?: string;
};

// Vendor model from /vendors/{vendorId}
export type Vendor = {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  website?: string;
  paymentTerms?: string;
  notes?: string;
  createdAt: Timestamp | Date;
  preferred: boolean;
  trades: ('Plumbing' | 'HVAC' | 'Electrical' | 'General')[];
  categories?: string[];
  locations: VendorLocation[];
  portalUrl?: string;
  deliveryOptions: ('Warehouse' | 'Tech Truck')[];
  addedBy?: string;
}


// This is a simplified Technician type for UI purposes, distinct from the main User type
export type Technician = {
  id: string;
  name: string;
  role: UserRole.Technician;
  color?: string;
}

export type TaxZone = {
    id: string;
    name: string;
    rate: number;
}

// Customer model from /customers/{customerId}
export type Customer = {
  id:string;
  primaryContact: { firstName: string; lastName: string; name: string; email: string; phone: string };
  companyInfo: { name: string; address: { street: string; city: string; state: string; zipCode: string; }; };
  taxRegion?: string; // For tax jurisdiction
  notes?: string;
  equipmentIds?: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  hasOpenInvoices?: boolean; // For UI badge
  smartTags?: ('High Churn Risk' | 'Frequent No-Show' | 'Recent Issue')[];
  recentTechnicians?: { id: string; name: string; avatarUrl?: string }[];
  // New referral fields
  referralCode?: string;
  referralsMade?: number;
  successfulConversions?: number;
  availableCredit?: number;
  referralTier?: 'Bronze' | 'Silver' | 'Gold';
};

export type UsedPart = {
    partId: string;
    name: string;
    sku: string;
    quantity: number;
    source: 'truck' | 'vendor'; // 'truck' for truck stock, 'vendor' for field purchase
    technicianId: string;
    unitCost: number;
    ourPrice: number;
    note?: string;
    timestamp: Timestamp | Date;
}

// Job model from /jobs/{jobId}
export type Job = {
  id: string;
  customerId: string;
  technicianId: string;
  additionalTechnicians?: string[];
  equipmentId?: string;
  status: 'unscheduled' | 'scheduled' | 'in_progress' | 'complete' | 'started' | 'on_hold' | 'awaiting_parts' | 'invoiced';
  schedule: {
    start: Date;
    end: Date;
    arrivalWindow?: string;
    multiDay: boolean;
    unscheduled: boolean;
  };
  duration: number;
  title: string;
  description: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  invoiceId?: string;
  estimateId?: string;
  agreementId?: string;
  tags?: string[];
  usedParts?: UsedPart[];
  color?: string;
  isAutoCreated?: boolean;
  linkedGoogleEventId?: string;
  isGhost?: boolean;
  // For UI enrichment
  customerName?: string;
  technicianName?: string;
  details: {
    serviceType: string;
    trade: 'Plumbing' | 'HVAC' | 'Electrical' | 'Other';
    category: string;
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

export type TierDetails = {
    description: string;
    price: number;
}

export type GbbTier = {
    good: TierDetails;
    better: TierDetails;
    best: TierDetails;
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
  name: string;
  customerId?: string; // Can be unassigned
  technicianId?: string; // Can be in warehouse or assigned
  make: string;
  model: string;
  serial: string;
  notes: string;
  purchaseDate?: Timestamp | Date;
  purchasePrice?: number;
  warrantyEndDate?: Timestamp | Date;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'decommissioned';
  lastInspectionDate?: Timestamp | Date;
  installedDate?: Timestamp | Date; // Kept for customer equipment
}

export type EquipmentLog = {
    id: string;
    equipmentId: string;
    timestamp: Timestamp | Date;
    technicianId: string;
    notes: string;
    type: 'usage' | 'repair' | 'inspection' | 'note' | 'new' | 'good' | 'fair' | 'poor' | 'decommissioned';
    // For UI Enrichment
    equipmentName?: string;
    technicianName?: string;
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
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed' | 'invoiced';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  customerName?: string; // For UI enrichment
  jobTitle?: string; // For UI enrichment
}

export type PurchaseOrderPart = {
    partId: string;
    qty: number;
    unitCost: number;
    itemName?: string; // For UI enrichment
}

// PurchaseOrder model from /purchaseOrders/{poId}
export interface PurchaseOrder {
  id: string;
  vendor: string;
  parts: PurchaseOrderPart[];
  status: 'draft' | 'ordered' | 'received' | 'delivered' | 'cancelled' | 'pending' | 'field-purchased' | 'completed';
  destination: 'Warehouse' | string; // Warehouse or technicianId
  jobId?: string;
  receiptImage?: string;
  orderDate: Timestamp | Date;
  expectedDeliveryDate?: Timestamp | Date;
  requestedBy: string; // userId
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  // For UI enrichment
  vendorId?: string;
  destinationName?: string;
  itemCount?: number;
  total: number;
  receivedBy?: string;
  receivedAt?: Timestamp | Date;
  deliveryNotes?: string;
  isFieldPurchase?: boolean;
}

// Pricebook model from /pricebook/{itemId}
export type PricebookItem = {
  id: string;
  title: string;
  description: string;
  trade: 'Plumbing' | 'Electrical' | 'HVAC' | 'General';
  price: number;
  materials?: { name: string, quantity: number }[];
  isCustom?: boolean;
  createdAt: Timestamp | Date;
  inventoryParts?: { partId: string; quantity: number; }[];
}

// Inventory Item model from /inventoryItems/{itemId}
export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  sku: string;
  modelNumber: string;
  partNumber: string;
  vendor: string; // Changed to vendor string
  category: string;
  trade: 'Plumbing' | 'HVAC' | 'Electrical' | 'General';
  quantityOnHand: number;
  reorderThreshold: number;
  reorderQtyDefault: number;
  warehouseLocation: string;
  truckLocations?: {
    technicianId: string;
    quantity: number;
  }[];
  unitCost: number;
  ourPrice: number;
  marketPrice?: number;
  images?: string[];
  linkedEstimateItems?: string[];
  createdAt: Timestamp | Date;
};

export type PartUsageLog = {
    id: string;
    partId: string;
    timestamp: Timestamp | Date;
    technicianId: string;
    jobId: string;
    quantity: number;
};

export type PartRequest = {
  id: string;
  technicianId: string;
  technicianName?: string;
  itemId?: string; // Link to a specific inventory item if known
  itemName: string; // Free text for quick requests
  quantity: number;
  jobId?: string; // Optional job reference
  notes?: string;
  status: 'pending' | 'fulfilled' | 'rejected';
  createdAt: Timestamp | Date;
  fulfilledAt?: Timestamp | Date;
}

export type ShoppingListItem = {
    id: string;
    itemId: string;
    itemName: string;
    quantityNeeded: number;
    reason: string;
    trade: 'Plumbing' | 'HVAC' | 'Electrical' | 'General';
    vendor: string;
    destination: string; // Warehouse or tech ID
    requestId?: string; // Link back to original PartRequest if applicable
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

// --- New Types from Revamp ---
export type Referral = {
    id: string;
    referrerCustomerId: string; // Who made the referral
    referredCustomerName: string;
    referredCustomerContact: string; // email or phone
    referralCodeUsed: string;
    status: 'pending' | 'contacted' | 'converted' | 'declined';
    dateReferred: Timestamp | Date;
    convertedDate?: Timestamp | Date;
    convertedJobId?: string;
    incentiveEarned?: number;
};

export type ReferralIncentive = {
    id: string;
    customerId: string;
    type: 'credit' | 'cash';
    amount: number;
    earnedDate: Timestamp | Date;
    redeemedDate?: Timestamp | Date;
    relatedReferralId: string;
    status: 'available' | 'redeemed';
};

export type CommunicationLog = {
    id: string;
    customerId: string;
    type: 'Email' | 'Call' | 'SMS' | 'Note';
    direction: 'inbound' | 'outbound';
    content: string;
    timestamp: Timestamp | Date;
    staffMemberId: string;
};

export interface CustomerData {
  customer: Customer;
  equipment: Equipment[];
  jobs: (Job & { technicianName: string })[];
  estimates: Estimate[];
  deposits: Deposit[];
  totals: CustomerTotals;
  linkedRecords: CustomerLinkedRecords;
  referrals?: Referral[];
  communicationLog?: CommunicationLog[];
}

export interface JobData {
    job: Job;
    customer: Customer;
    technician: Technician | null;
    estimates: Estimate[];
    changeOrders: ChangeOrder[];
}

export interface EstimateData {
    estimate: Estimate;
    customer: Customer;
    job: Job | null;
}

export interface PurchaseOrderData {
    po: PurchaseOrder;
    requestedBy: string | null;
    destinationName: string;
}


// --- Template Types ---
export type EstimateTemplate = {
    id: string;
    title: string;
    lineItems: LineItem[];
    gbbTier?: GbbTier | null;
}

// --- Google Calendar Sync Types ---
export type GoogleCalendarEvent = {
    eventId: string;
    calendarId: string;
    start: Timestamp | Date;
    end: Timestamp | Date;
    summary: string;
    description: string;
    createdBy: string;
    matchedTechnicianId?: string;
    status: 'confirmed' | 'cancelled';
    linkedJobId?: string;
    source: 'google';
    syncedAt: Timestamp | Date | any; // Any for FieldValue
}
