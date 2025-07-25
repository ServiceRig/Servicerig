

import { Customer, Invoice, Job, Technician, UserRole, Equipment, Estimate, EstimateTemplate, PricebookItem, InventoryItem, Payment, ServiceAgreement, Refund, TaxLine, PaymentPlan, Deposit, ChangeOrder, AuditLogEntry, TaxZone } from './types';

const getDay = (day: number) => {
    const newDate = new Date();
    const currentDay = newDate.getDay();
    const distance = day - currentDay;
    newDate.setDate(newDate.getDate() + distance);
    return newDate;
}

// Wrapping our mock data in a single object makes it mutable across requests
// in a Node.js development server environment. This simulates a persistent store.
export const mockData = {
  taxZones: [
    { id: 'ca-sv', name: 'California (Silicon Valley)', rate: 0.0925 },
    { id: 'il-metro', name: 'Illinois (Metropolis)', rate: 0.08 },
    { id: 'ny-gotham', name: 'New York (Gotham)', rate: 0.08875 },
    { id: 'no-tax', name: 'No Tax', rate: 0 },
  ] as TaxZone[],
  changeOrders: [
    {
      id: 'co1',
      jobId: 'job1',
      customerId: 'cust1',
      title: 'Upgrade to Smart Thermostat',
      description: 'Customer requested an upgrade from the standard thermostat to a Nest Smart Thermostat.',
      lineItems: [
        { description: 'Nest Learning Thermostat', quantity: 1, unitPrice: 249.00 },
        { description: 'Additional Labor for Setup', quantity: 1, unitPrice: 75.00 },
      ],
      total: 324.00,
      status: 'approved',
      createdAt: new Date('2024-07-10T11:00:00Z'),
      updatedAt: new Date('2024-07-10T11:30:00Z'),
    },
    {
      id: 'co2',
      jobId: 'job2',
      customerId: 'cust2',
      title: 'Additional Outlet Installation',
      description: 'While on site, customer requested an additional GFCI outlet to be installed by the sink.',
       lineItems: [
        { description: '15 Amp GFCI Outlet', quantity: 1, unitPrice: 28.00 },
        { description: 'Labor for new outlet', quantity: 1, unitPrice: 120.00 },
      ],
      total: 148.00,
      status: 'invoiced',
      createdAt: new Date('2024-06-01T11:00:00Z'),
      updatedAt: new Date('2024-06-01T11:30:00Z'),
    }
  ] as ChangeOrder[],
  deposits: [
    { id: 'dep1', customerId: 'cust2', amount: 500.00, status: 'available', createdAt: new Date('2024-07-01'), originalInvoiceId: 'inv_dep_123' },
  ] as Deposit[],
  refunds: [
    { id: 'ref1', invoiceId: 'inv1', amount: 50.00, date: new Date('2024-07-16'), method: 'original_payment', reason: 'Goodwill gesture for delay', processedBy: 'user_admin_01' }
  ] as Refund[],
  serviceAgreements: [
    {
        id: 'sa1',
        title: 'Innovate Inc. HVAC Platinum Plan',
        customerId: 'cust1',
        status: 'active',
        billingSchedule: { frequency: 'quarterly', nextDueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) },
        autoInvoiceEnabled: true,
        startDate: new Date('2023-01-01'),
        linkedJobIds: [],
        amount: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'sa2',
        title: 'Solutions Corp. Monthly Maintenance',
        customerId: 'cust2',
        status: 'active',
        billingSchedule: { frequency: 'monthly', nextDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20) },
        autoInvoiceEnabled: false,
        startDate: new Date('2024-03-01'),
        linkedJobIds: [],
        amount: 250,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
     {
        id: 'sa3',
        title: 'Gadgets & More Annual Checkup',
        customerId: 'cust3',
        status: 'cancelled',
        billingSchedule: { frequency: 'annually', nextDueDate: new Date('2025-01-15') },
        autoInvoiceEnabled: true,
        startDate: new Date('2023-01-15'),
        endDate: new Date('2024-01-14'),
        linkedJobIds: [],
        amount: 800,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
  ] as ServiceAgreement[],
  payments: [
    { id: 'pay1', invoiceId: 'inv1', customerId: 'cust1', amount: 324.00, date: new Date('2024-07-15'), method: 'Credit Card', transactionId: 'ch_12345', recordedBy: 'user_admin_01' },
    { id: 'pay2', invoiceId: 'inv2', customerId: 'cust2', amount: 400.00, date: new Date('2024-07-05'), method: 'Check', transactionId: 'check_1054', recordedBy: 'user_admin_01' },
    { id: 'pay3', invoiceId: 'inv3', customerId: 'cust3', amount: 108.00, date: new Date('2024-07-20'), method: 'Credit Card', transactionId: 'ch_67890', recordedBy: 'user_admin_01' },
  ] as Payment[],
  inventoryItems: [
    { id: 'inv_part_001', name: 'Dual-run Capacitor 45/5 MFD', description: 'Oval run capacitor for HVAC condenser units.', sku: 'CAP-45-5', partNumber: 'PRCFD455A', warehouseLocation: 'Aisle 3, Bin 4', quantityOnHand: 50, reorderThreshold: 10, unitCost: 12.50, ourPrice: 35.00, vendor: 'Johnstone Supply', trade: 'HVAC', createdAt: new Date(), category: 'Capacitors', reorderQtyDefault: 20, truckLocations: [{technicianId: 'tech1', quantity: 5}] },
    { id: 'inv_part_002', name: '1/2" PEX-A Pipe (100ft)', description: 'Uponor PEX-A pipe for plumbing.', sku: 'PEX-A-050-100', partNumber: 'F1040500', warehouseLocation: 'Aisle 1, Bay 2', quantityOnHand: 20, reorderThreshold: 5, unitCost: 45.00, ourPrice: 75.00, vendor: 'Ferguson', trade: 'Plumbing', createdAt: new Date(), category: 'Piping', reorderQtyDefault: 10, truckLocations: [] },
    { id: 'inv_part_003', name: '15 Amp GFCI Outlet', description: 'Leviton GFCI duplex receptacle, white.', sku: 'ELEC-GFCI-15A', partNumber: 'GFTR1-W', warehouseLocation: 'Aisle 5, Bin 12', quantityOnHand: 150, reorderThreshold: 25, unitCost: 15.00, ourPrice: 28.00, vendor: 'Home Depot Pro', trade: 'Electrical', createdAt: new Date(), category: 'Outlets', reorderQtyDefault: 50, truckLocations: [{technicianId: 'tech1', quantity: 10}, {technicianId: 'tech2', quantity: 8}] },
    { id: 'inv_part_004', name: 'Standard 1-Handle Faucet', description: 'Moen chrome single handle kitchen faucet.', sku: 'FAUC-K-MOEN-1H', modelNumber: '7425', warehouseLocation: 'Aisle 1, Bin 6', quantityOnHand: 15, reorderThreshold: 5, unitCost: 95.00, ourPrice: 165.00, vendor: 'Ferguson', trade: 'Plumbing', createdAt: new Date(), category: 'Faucets', reorderQtyDefault: 5, truckLocations: [] },
    { id: 'inv_part_005', name: 'Ignition Control Board', description: 'Universal ignition control board for furnaces.', sku: 'HVAC-ICB-UNIV', partNumber: 'ICM282A', warehouseLocation: 'Aisle 3, Bin 8', quantityOnHand: 8, reorderThreshold: 2, unitCost: 85.00, ourPrice: 210.00, vendor: 'RE Michel', trade: 'HVAC', createdAt: new Date(), category: 'Control Boards', reorderQtyDefault: 4, truckLocations: [{technicianId: 'tech1', quantity: 1}] },
  ] as InventoryItem[],
  technicians: [
    { id: 'tech1', name: 'John Doe', role: UserRole.Technician },
    { id: 'tech2', name: 'Jane Smith', role: UserRole.Technician },
    { id: 'tech3', name: 'Mike Johnson', role: UserRole.Technician },
    { id: 'tech4', name: 'Emily Brown', role: UserRole.Technician },
  ] as Technician[],
  customers: [
    {
      id: 'cust1',
      primaryContact: { name: 'Alice Williams', email: 'alice@example.com', phone: '123-456-7890' },
      companyInfo: { name: 'Innovate Inc.', address: '123 Tech Park, Silicon Valley, CA 94000' },
      taxRegion: 'ca-sv',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cust2',
      primaryContact: { name: 'Bob Davis', email: 'bob@example.com', phone: '234-567-8901' },
      companyInfo: { name: 'Solutions Corp.', address: '456 Business Blvd, Metropolis, IL 62960' },
      taxRegion: 'il-metro',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
      {
      id: 'cust3',
      primaryContact: { name: 'Charlie Miller', email: 'charlie@example.com', phone: '345-678-9012' },
      companyInfo: { name: 'Gadgets & More', address: '789 Market St, Gotham, NY 10001' },
      taxRegion: 'ny-gotham',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] as Customer[],
  jobs: [
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
      status: 'complete',
      title: 'Leaky Faucet',
      description: 'Repair leaky faucet in master bathroom.',
      details: { serviceType: 'Plumbing Repair' },
       createdAt: new Date(),
      updatedAt: new Date(),
      duration: 150,
      invoiceId: 'inv2',
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
      status: 'complete',
      title: 'Dishwasher Install',
      description: 'Install new Bosch dishwasher.',
      details: { serviceType: 'Appliance Installation' },
      createdAt: new Date(),
      updatedAt: new Date(),
      duration: 120,
      invoiceId: 'inv3',
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
  ] as Job[],
  invoices: [
    {
      id: 'inv1',
      invoiceNumber: 'INV-2024-001',
      customerId: 'cust1',
      jobIds: ['job1'],
      title: 'HVAC Tune-up Invoice',
      status: 'refunded',
      issueDate: new Date('2024-07-10'),
      dueDate: new Date('2024-08-09'),
      lineItems: [
        { description: 'Annual HVAC Maintenance Service', quantity: 1, unitPrice: 250, origin: { type: 'estimate', id: 'est1' } },
        { description: 'Replacement 1-inch Filter', quantity: 2, unitPrice: 25, origin: { type: 'estimate', id: 'est1' } },
      ],
      subtotal: 300.00,
      taxes: [ { name: 'CA State Tax', amount: 24.00, rate: 0.08 }],
      total: 324.00,
      amountPaid: 324.00,
      balanceDue: 0.00,
      paymentTerms: 'Net 30',
      createdAt: new Date('2024-07-10'),
      linkedEstimateIds: ['est1'],
      quickbooksSync: {
        status: 'synced',
        lastSync: new Date(),
      },
      commission: [
        { technicianId: 'tech1', rate: 0.1, amount: 32.40, technicianName: 'John Doe' }
      ],
      auditLog: [
        { id: 'log1', timestamp: new Date('2024-07-10T11:05:00Z'), userId: 'tech1', userName: 'John Doe', action: 'Invoice Created', details: 'Created from job JOB-9611 after completion.' },
        { id: 'log2', timestamp: new Date('2024-07-10T14:20:00Z'), userId: 'admin1', userName: 'Admin User', action: 'Invoice Approved', details: 'Approved after review.' },
        { id: 'log3', timestamp: new Date('2024-07-10T14:21:00Z'), userId: 'system', userName: 'System', action: 'Email Sent', details: 'Invoice sent to alice@example.com.' },
        { id: 'log4', timestamp: new Date('2024-07-15T09:15:00Z'), userId: 'cust1', userName: 'Alice Williams', action: 'Payment Received', details: 'Paid $324.00 via Credit Card.' },
        { id: 'log5', timestamp: new Date('2024-07-16T10:00:00Z'), userId: 'admin1', userName: 'Admin User', action: 'Refund Issued', details: 'Refunded $50.00 as goodwill gesture.' },
      ] as AuditLogEntry[],
    },
    {
      id: 'inv2',
      invoiceNumber: 'INV-2024-002',
      customerId: 'cust2',
      jobIds: ['job2'],
      title: 'Plumbing Repair Invoice',
      status: 'partially_paid',
      issueDate: new Date('2024-06-01'),
      dueDate: new Date('2024-07-01'),
      lineItems: [
        { description: 'Emergency Callout Fee', quantity: 1, unitPrice: 150 },
        { description: 'Repair Kitchen Sink Leak', quantity: 1, unitPrice: 200, origin: { type: 'estimate', id: 'est2' } },
        { description: 'Replace Garbage Disposal', quantity: 1, unitPrice: 450, origin: { type: 'estimate', id: 'est2' } },
      ],
      subtotal: 800.00,
      taxes: [{ name: 'IL State Tax', amount: 64.00, rate: 0.08 }],
      total: 864.00,
      amountPaid: 400.00,
      balanceDue: 464.00,
      paymentTerms: 'Due on receipt',
      createdAt: new Date('2024-06-01'),
      linkedEstimateIds: ['est2'],
      linkedChangeOrderIds: ['co2'],
      quickbooksSync: {
        status: 'error',
        lastSync: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        error: 'Customer mapping failed: Customer "Solutions Corp." not found in QuickBooks.',
      },
       commission: [
        { technicianId: 'tech2', rate: 0.12, amount: 103.68, technicianName: 'Jane Smith' }
      ]
    },
    {
      id: 'inv3',
      invoiceNumber: 'INV-2024-003',
      customerId: 'cust3',
      jobIds: ['job4'],
      title: 'Appliance Install Invoice',
      status: 'sent',
      issueDate: new Date('2024-07-18'),
      dueDate: new Date('2024-08-17'),
       lineItems: [
        { description: 'Installation of customer-provided dishwasher', quantity: 1, unitPrice: 250 },
        { description: 'Haul away old appliance', quantity: 1, unitPrice: 50 },
      ],
      subtotal: 300.00,
      taxes: [{ name: 'NY State Tax', amount: 24.00, rate: 0.08 }],
      total: 324.00,
      amountPaid: 108.00,
      balanceDue: 216.00,
      paymentTerms: 'Net 30',
      createdAt: new Date('2024-07-18'),
      quickbooksSync: {
        status: 'pending',
      },
      paymentPlan: {
        type: 'manual',
        totalAmount: 324.00,
        schedule: [
            { amount: 108.00, dueDate: new Date('2024-07-18'), status: 'paid', paymentId: 'pay3' },
            { amount: 108.00, dueDate: new Date('2024-08-17'), status: 'pending' },
            { amount: 108.00, dueDate: new Date('2024-09-16'), status: 'pending' },
        ]
      },
       commission: [
        { technicianId: 'tech3', rate: 0.08, amount: 25.92, technicianName: 'Mike Johnson' }
      ]
    },
     {
      id: 'inv4',
      invoiceNumber: 'INV-2024-004',
      customerId: 'cust1',
      title: 'Quarterly Service Agreement',
      status: 'draft',
      issueDate: new Date('2024-07-20'),
      dueDate: new Date('2024-08-19'),
       lineItems: [
        { description: 'Q3 Service Agreement Maintenance', quantity: 1, unitPrice: 500, origin: { type: 'agreement', id: 'sa1' } },
      ],
      subtotal: 500.00,
      taxes: [{ name: 'CA State Tax', amount: 40.00, rate: 0.08 }],
      total: 540.00,
      amountPaid: 0.00,
      balanceDue: 540.00,
      paymentTerms: 'Net 30',
      createdAt: new Date('2024-07-20'),
      linkedServiceAgreementId: 'sa1'
    },
  ] as Invoice[],
  equipment: [
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
  ] as Equipment[],
  estimates: [
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
          taxes: [
            { name: "State Sales Tax", rate: 0.06, amount: 595.20 },
            { name: "County Sales Tax", rate: 0.01, amount: 99.20 }
          ],
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
          taxes: [{ name: "Sales Tax", rate: 0.08, amount: 20 }],
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
  ] as Estimate[],
  estimateTemplates: [
      {
          id: 'template-wh-install',
          title: 'Water Heater Installation',
          lineItems: [
              { description: 'Bradford White 50-Gallon Gas Water Heater', quantity: 1, unitPrice: 1200 },
              { description: 'Installation Labor', quantity: 4, unitPrice: 150 },
              { description: 'New Gas Line & Fittings', quantity: 1, unitPrice: 250 },
              { description: 'Haul Away Old Unit', quantity: 1, unitPrice: 75 },
          ],
          gbbTier: {
              good: 'Install a standard 50-gallon gas water heater with a 6-year warranty. Includes basic code compliance and haul-away of the old unit.',
              better: 'Install a high-efficiency 50-gallon gas water heater with an 8-year warranty. Includes a new expansion tank and upgraded shut-off valve.',
              best: 'Install a premium, condensing tankless water heater for endless hot water and maximum energy savings. Includes a 12-year warranty and a whole-home plumbing inspection.',
          }
      },
      {
          id: 'template-ac-diag',
          title: 'A/C System Diagnosis',
          lineItems: [
              { description: 'HVAC Diagnostic Fee', quantity: 1, unitPrice: 99 },
          ],
          gbbTier: {
              good: 'Perform a full system diagnostic to identify the root cause of the issue. Provide a detailed report of findings and a quote for necessary repairs.',
              better: 'Includes the diagnostic plus a basic refrigerant level check and top-off (up to 1lb of R-410A) and a standard filter replacement.',
              best: 'Includes the diagnostic, refrigerant service, a new filter, and a comprehensive coil cleaning (indoor and outdoor) to restore system efficiency.',
          }
      },
      {
          id: 'template-repipe',
          title: 'Whole Home Repipe',
          lineItems: [
              { description: 'PEX-A Piping for Whole Home', quantity: 200, unitPrice: 5 },
              { description: 'Labor for Repipe', quantity: 40, unitPrice: 150 },
              { description: 'Drywall Repair & Patching', quantity: 1, unitPrice: 2500 },
              { description: 'Permits and Inspection', quantity: 1, unitPrice: 500 },
          ],
          gbbTier: {
              good: 'Repipe the entire home with standard PEX-B tubing. Includes drywall access cuts and basic patching (not textured or painted).',
              better: 'Repipe using superior PEX-A tubing and install new quarter-turn shut-off valves at all fixtures. Includes professional drywall repair with texture matching.',
              best: 'Repipe with PEX-A, new valves, and include a new whole-home water filtration system and a pressure-reducing valve (PRV) for ultimate protection and water quality. Includes professional drywall repair, texture, and primer.',
          }
      },
  ] as EstimateTemplate[],
  pricebookItems: [
    { id: 'pb_hvac_002', title: 'Capacitor Replacement', description: 'Replace dual-run capacitor for outdoor unit.', trade: 'HVAC', price: 280, estimatedLaborHours: 0.75, inventoryParts: [{ partId: 'inv_part_001', quantity: 1 }], isUrgent: true, createdAt: new Date() },
    { id: 'pb_plumb_001', title: 'Standard Faucet Install', description: 'Install customer-provided faucet.', trade: 'Plumbing', price: 250, estimatedLaborHours: 1.5, inventoryParts: [{ partId: 'inv_part_004', quantity: 1 }], createdAt: new Date() },
    { id: 'pb_plumb_002', title: 'Drain Clearing (Main Line)', description: 'Cable main sewer line up to 100ft.', trade: 'Plumbing', price: 450, isUrgent: true, createdAt: new Date() },
    { id: 'pb_plumb_003', title: 'Toilet Rebuild', description: 'Replace all internal tank components.', trade: 'Plumbing', price: 320, estimatedLaborHours: 1, createdAt: new Date() },
    { id: 'pb_hvac_001', title: 'AC Tune-up', description: 'Comprehensive cleaning and inspection of AC system.', trade: 'HVAC', price: 129, estimatedLaborHours: 1, inventoryParts: [], createdAt: new Date() },
    { id: 'pb_elec_001', title: 'GFCI Outlet Replacement', description: 'Replace a single GFCI electrical outlet.', trade: 'Electrical', price: 150, estimatedLaborHours: 0.5, inventoryParts: [{ partId: 'inv_part_003', quantity: 1 }], createdAt: new Date() },
    { id: 'pb_elec_002', title: 'Ceiling Fan Installation', description: 'Install customer-provided ceiling fan on existing brace.', trade: 'Electrical', price: 300, estimatedLaborHours: 2, createdAt: new Date() },
  ] as PricebookItem[],
};

// Re-exporting for easy access if needed, but primary interaction should be via mockData
export const { mockTechnicians, mockCustomers, mockJobs, mockInvoices, mockEquipment, mockEstimates, mockEstimateTemplates, mockPricebookItems, mockInventoryItems, mockPayments, mockServiceAgreements, mockRefunds, mockDeposits, mockChangeOrders, mockTaxZones } = mockData;
