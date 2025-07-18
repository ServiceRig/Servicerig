
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

// This is a simplified Technician type for UI purposes, distinct from the main User type
export type Technician = {
  id: string;
  name: string;
  role: UserRole.Technician;
}

// Simplified Customer for UI purposes
export type Customer = {
  id: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  companyInfo: {
    name: string;
    address: string;
  };
}

// This is a simplified Job type for UI purposes
export type Job = {
  id: string;
  customerId: string;
  technicianId: string;
  schedule: {
    start: Date;
    end: Date;
  };
  status: 'scheduled' | 'in_progress' | 'complete' | 'unscheduled';
  title: string;
  description: string;
  details: {
    serviceType: string;
  };
}

// This is a simplified Invoice type for UI purposes
export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: 'Paid' | 'Overdue';
  issueDate: Date;
  dueDate: Date;
};
