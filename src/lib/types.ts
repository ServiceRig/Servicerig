// A generic type for Firestore Timestamps.
// In Firestore, these are objects, but in the client, we'll often work with JS Date objects.
export type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

export enum UserRole {
  Admin = 'admin',
  Dispatcher = 'dispatcher',
  Technician = 'technician',
}

export type Job = {
  id: string; // Document ID
  customerId: string;
  technicianId: string;
  serviceType: string;
  status: "unscheduled" | "scheduled" | "in_progress" | "complete";
  scheduledStart: Timestamp;
  scheduledEnd: Timestamp;
  duration: number;
  title: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  invoiceId?: string;
  agreementId?: string;
  tags?: string[];
  color?: string;
};

export type Customer = {
  id: string; // Document ID
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  equipmentIds?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type User = {
  id: string; // Document ID (uid)
  name: string;
  email: string;
  role: "admin" | "dispatcher" | "technician";
  active: boolean;
  teamId: string;
  avatarUrl?: string;
};

export type ServiceAgreement = {
  id: string; // Document ID
  customerId: string;
  recurringInterval: "monthly" | "quarterly" | "annual" | "one_time";
  startDate: Timestamp;
  endDate?: Timestamp;
  linkedJobIds: string[];
  billingAmount: number;
  billingFrequency: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Invoice = {
  id: string; // Document ID
  jobId: string;
  customerId: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  stripePaymentLink?: string;
  dueDate: Timestamp;
  createdAt: Timestamp;
};

export type Equipment = {
  id: string; // Document ID
  customerId: string;
  type: string;
  model: string;
  serialNumber: string;
  notes?: string;
  installedDate?: Timestamp;
};

export type TimecardEntry = {
  clockIn: Timestamp;
  clockOut: Timestamp;
  jobId?: string;
};

export type Timecard = {
  id: string; // Document ID, format: {userId}_{weekId}
  entries: TimecardEntry[];
  weekStart: Timestamp;
  userId: string;
};

export type GbbEstimate = {
  id: string; // Document ID
  customerId: string;
  jobId?: string;
  tiers: {
    good: string;
    better: string;
    best: string;
  };
  selectedTier?: "good" | "better" | "best";
  aiTrained: boolean;
  createdAt: Timestamp;
};

export type ChangeOrder = {
  id: string; // Document ID
  jobId: string;
  customerId: string;
  description: string;
  amountDelta: number;
  approved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type PurchaseOrderItem = {
  name: string;
  quantity: number;
  unitCost: number;
};

export type PurchaseOrder = {
  id: string; // Document ID
  requestedBy: string;
  approvedBy?: string;
  vendor: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  jobId?: string;
  status: "requested" | "approved" | "ordered" | "received";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type PricebookItem = {
  id: string; // Document ID
  category: string;
  name: string;
  description: string;
  basePrice: number;
  cost: number;
  taxable: boolean;
  sku?: string;
  createdAt: Timestamp;
};

export type Form = {
  id: string; // Document ID
  name: string;
  type: "inspection" | "safety" | "custom";
  fields: any[]; // Field JSON schema
  linkedJobId?: string;
  submittedBy: string;
  submittedAt: Timestamp;
};

export type Automation = {
  id: string; // Document ID
  trigger: string;
  action: string;
  config: any;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Timesheet = {
  id: string; // Document ID, format: {userId}_{weekId}
  userId: string;
  weekStart: Timestamp;
  summary: {
    totalHours: number;
    overtimeHours: number;
    jobsWorked: number;
  };
  reviewed: boolean;
};

// This is a simplified Technician type for UI purposes, distinct from the main User type
export type Technician = {
  id: string;
  name: string;
  role: UserRole.Technician;
}
