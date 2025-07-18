
import { Customer, Invoice, Job, Technician, UserRole, Equipment, Estimate } from './types';

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
    companyInfo: { name: 'Innovate Inc.', address: '123 Tech Park, Silicon Valley, CA 94000' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cust2',
    primaryContact: { name: 'Bob Davis', email: 'bob@example.com', phone: '234-567-8901' },
    companyInfo: { name: 'Solutions Corp.', address: '456 Business Blvd, Metropolis, IL 62960' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
    {
    id: 'cust3',
    primaryContact: { name: 'Charlie Miller', email: 'charlie@example.com', phone: '345-678-9012' },
    companyInfo: { name: 'Gadgets & More', address: '789 Market St, Gotham, NY 10001' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const today = new Date();
const getDay = (day: number) => {
    const newDate = new Date();
    const currentDay = newDate.getDay();
    const distance = day - currentDay;
    newDate.setDate(newDate.getDate() + distance);
    return newDate;
}

export const mockJobs: Job[] = [
  {
    id: 'job1',
    customerId: 'cust1',
    technicianId: 'tech1',
    schedule: { start: new Date(getDay(1).setHours(9, 0, 0, 0)), end: new Date(getDay(1).setHours(11, 0, 0, 0)) },
    status: 'complete',
    title: 'HVAC Tune-up',
    description: 'Annual maintenance for HVAC system.',
    details: { serviceType: 'HVAC Maintenance' },
    createdAt: new Date(),
    updatedAt: new Date(),
    duration: 120,
    invoiceId: 'inv1',
  },
  {
    id: 'job2',
    customerId: 'cust2',
    technicianId: 'tech2',
    schedule: { start: new Date(getDay(1).setHours(10, 0, 0, 0)), end: new Date(getDay(1).setHours(12, 30, 0, 0)) },
    status: 'in_progress',
    title: 'Leaky Faucet',
    description: 'Repair leaky faucet in master bathroom.',
    details: { serviceType: 'Plumbing Repair' },
     createdAt: new Date(),
    updatedAt: new Date(),
    duration: 150,
  },
  {
    id: 'job3',
    customerId: 'cust1',
    technicianId: 'tech1',
    schedule: { start: new Date(getDay(2).setHours(13, 0, 0, 0)), end: new Date(getDay(2).setHours(14, 30, 0, 0)) },
    status: 'scheduled',
    title: 'Panel Upgrade',
    description: 'Upgrade main electrical panel.',
    details: { serviceType: 'Electrical Inspection' },
    createdAt: new Date(),
    updatedAt: new Date(),
    duration: 90,
  },
   {
    id: 'job4',
    customerId: 'cust3',
    technicianId: 'tech3',
    schedule: { start: new Date(getDay(3).setHours(8, 0, 0, 0)), end: new Date(getDay(3).setHours(10, 0, 0, 0)) },
    status: 'scheduled',
    title: 'Dishwasher Install',
    description: 'Install new Bosch dishwasher.',
    details: { serviceType: 'Appliance Installation' },
    createdAt: new Date(),
    updatedAt: new Date(),
    duration: 120,
  },
  {
    id: 'job5',
    customerId: 'cust2',
    technicianId: 'tech4',
    schedule: { start: new Date(getDay(4).setHours(14, 0, 0, 0)), end: new Date(getDay(4).setHours(16, 0, 0, 0)) },
    status: 'scheduled',
    title: 'Router Setup',
    description: 'Setup new office network router.',
    details: { serviceType: 'Network Setup' },
    createdAt: new Date(),
    updatedAt: new Date(),
    duration: 120,
  },
  {
    id: 'job6',
    customerId: 'cust3',
    technicianId: '',
    schedule: { start: new Date(), end: new Date() },
    status: 'unscheduled',
    title: 'Quote for AC',
    description: 'Provide quote for new AC unit.',
    details: { serviceType: 'Estimate' },
    createdAt: new Date(),
    updatedAt: new Date(),
    duration: 60,
  },
  {
    id: 'job7',
    customerId: 'cust1',
    technicianId: '',
    schedule: { start: new Date(), end: new Date() },
    status: 'unscheduled',
    title: 'Fix Garage Door',
    description: 'Garage door opener not working.',
    details: { serviceType: 'Repair' },
    createdAt: new Date(),
    updatedAt: new Date(),
    duration: 60,
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-001',
    customerId: 'cust1',
    jobId: 'job1',
    title: 'HVAC Tune-up Invoice',
    amount: 1500.00,
    status: 'Paid',
    issueDate: new Date(),
    dueDate: new Date(),
    createdAt: new Date(),
     lineItems: [
        { description: 'HVAC Tune-up Service', quantity: 1, unitPrice: 1500 }
    ]
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-002',
    customerId: 'cust2',
    title: 'Plumbing Repair Invoice',
    amount: 750.50,
    status: 'Overdue',
    issueDate: new Date(),
    dueDate: new Date(),
    createdAt: new Date(),
    lineItems: [
        { description: 'Leaky Faucet Repair', quantity: 1, unitPrice: 750.50 }
    ]
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-003',
    customerId: 'cust3',
    title: 'Appliance Install Invoice',
    amount: 2500.75,
    status: 'Paid',
    issueDate: new Date(),
    dueDate: new Date(),
    createdAt: new Date(),
    lineItems: [
        { description: 'Dishwasher Installation', quantity: 1, unitPrice: 2500.75 }
    ]
  }
];

export const mockEquipment: Equipment[] = [
    {
        id: 'equip1',
        customerId: 'cust1',
        make: 'Carrier',
        model: '59MN7A',
        serial: 'SN12345ABC',
        notes: 'Main HVAC unit for the primary building. Installed 2021.',
        installedDate: new Date('2021-06-15'),
    },
    {
        id: 'equip2',
        customerId: 'cust1',
        make: 'Rheem',
        model: 'XE50M12',
        serial: 'SN67890DEF',
        notes: 'Water heater, 50-gallon capacity.',
        installedDate: new Date('2021-06-15'),
    },
     {
        id: 'equip3',
        customerId: 'cust2',
        make: 'Generac',
        model: 'Guardian 22kW',
        serial: 'SN55511GHI',
        notes: 'Backup generator for server room.',
        installedDate: new Date('2022-01-20'),
    }
];

export const mockEstimates: Estimate[] = [
    {
        id: 'est1',
        estimateNumber: 'EST-001',
        title: 'Full HVAC System Replacement',
        customerId: 'cust1',
        jobId: 'job1',
        status: 'accepted',
        lineItems: [
            { description: 'Carrier Infinity Series AC Unit', quantity: 1, unitPrice: 4500 },
            { description: 'Carrier Infinity Series Furnace', quantity: 1, unitPrice: 3200 },
            { description: 'Labor and Installation', quantity: 16, unitPrice: 120 },
            { description: 'Ductwork Modification', quantity: 1, unitPrice: 800 },
        ],
        subtotal: 10420,
        discount: 500,
        tax: 694.40,
        total: 10614.40,
        notes: 'This estimate includes a 5-year parts and labor warranty. A 10-year extended warranty is available.',
        gbbTier: {
            good: "Basic replacement with a standard efficiency unit. Includes essential installation services.",
            better: "Upgraded, high-efficiency unit with a smart thermostat. Includes full system flush and balancing.",
            best: "Top-of-the-line, variable-speed system with zoning capabilities, advanced air purification, and a 10-year extended warranty.",
        },
        createdBy: 'user_admin_01',
        createdAt: new Date('2024-07-10T10:00:00Z'),
        updatedAt: new Date('2024-07-11T14:30:00Z'),
    },
    {
        id: 'est2',
        estimateNumber: 'EST-002',
        title: 'Leaky Faucet Repair Options',
        customerId: 'cust2',
        jobId: 'job2',
        status: 'sent',
        lineItems: [
            { description: 'Faucet Cartridge Replacement', quantity: 1, unitPrice: 150 },
            { description: 'Labor', quantity: 1, unitPrice: 100 },
        ],
        subtotal: 250,
        discount: 0,
        tax: 20,
        total: 270,
        notes: 'Repair of existing Moen faucet in master bathroom.',
        gbbTier: {
            good: "Replace the cartridge in the existing faucet to stop the leak.",
            better: "Replace the entire faucet with a new, mid-grade Delta model.",
            best: "Upgrade to a premium Kohler faucet with a lifetime warranty and new supply lines.",
        },
        createdBy: 'tech1',
        createdAt: new Date('2024-07-15T09:00:00Z'),
        updatedAt: new Date('2024-07-15T09:30:00Z'),
    }
]
