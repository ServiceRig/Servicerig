import { Customer, Invoice, Job, Technician, UserRole } from './types';

export const mockTechnicians: Technician[] = [
  { id: 'tech1', name: 'John Doe', role: UserRole.Technician },
  { id: 'tech2', name: 'Jane Smith', role: UserRole.Technician },
  { id: 'tech3', name: 'Mike Johnson', role: UserRole.Technician },
  { id: 'tech4', name: 'Emily Brown', role: UserRole.Technician },
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust1',
    primaryContact: { name: 'Alice Williams', email: 'alice@example.com', phone: '123-456-7890' },
    companyInfo: { name: 'Innovate Inc.', address: '123 Tech Park' },
  },
  {
    id: 'cust2',
    primaryContact: { name: 'Bob Davis', email: 'bob@example.com', phone: '234-567-8901' },
    companyInfo: { name: 'Solutions Corp.', address: '456 Business Blvd' },
  },
    {
    id: 'cust3',
    primaryContact: { name: 'Charlie Miller', email: 'charlie@example.com', phone: '345-678-9012' },
    companyInfo: { name: 'Gadgets & More', address: '789 Market St' },
  },
];

export const mockJobs: Job[] = [
  {
    id: 'job1',
    customerId: 'cust1',
    technicianId: 'tech1',
    schedule: { start: new Date(new Date().setHours(9, 0, 0)), end: new Date(new Date().setHours(11, 0, 0)) },
    status: 'Scheduled',
    details: { serviceType: 'HVAC Maintenance' },
  },
  {
    id: 'job2',
    customerId: 'cust2',
    technicianId: 'tech2',
    schedule: { start: new Date(new Date().setHours(10, 0, 0)), end: new Date(new Date().setHours(12, 0, 0)) },
    status: 'In Progress',
    details: { serviceType: 'Plumbing Repair' },
  },
  {
    id: 'job3',
    customerId: 'cust1',
    technicianId: 'tech1',
    schedule: { start: new Date(new Date().setHours(13, 0, 0)), end: new Date(new Date().setHours(14, 30, 0)) },
    status: 'Completed',
    details: { serviceType: 'Electrical Inspection' },
  },
   {
    id: 'job4',
    customerId: 'cust3',
    technicianId: 'tech3',
    schedule: { start: new Date(new Date().setDate(new Date().getDate() + 1)), end: new Date(new Date().setDate(new Date().getDate() + 1)) },
    status: 'Scheduled',
    details: { serviceType: 'Appliance Installation' },
  },
  {
    id: 'job5',
    customerId: 'cust2',
    technicianId: 'tech4',
    schedule: { start: new Date(new Date().setHours(14, 0, 0)), end: new Date(new Date().setHours(16, 0, 0)) },
    status: 'Completed',
    details: { serviceType: 'Network Setup' },
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-001',
    customerId: 'cust1',
    customerName: 'Innovate Inc.',
    amount: 1500.00,
    status: 'Paid',
    issueDate: new Date(),
    dueDate: new Date(),
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-002',
    customerId: 'cust2',
    customerName: 'Solutions Corp.',
    amount: 750.50,
    status: 'Overdue',
    issueDate: new Date(),
    dueDate: new Date(),
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-003',
    customerId: 'cust3',
    customerName: 'Gadgets & More',
    amount: 2500.75,
    status: 'Paid',
    issueDate: new Date(),
    dueDate: new Date(),
  }
];
