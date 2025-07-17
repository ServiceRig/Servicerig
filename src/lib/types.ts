export enum UserRole {
  Admin = 'admin',
  Dispatcher = 'dispatcher',
  Technician = 'technician',
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId: string;
};

export type Technician = {
    id: string;
    name: string;
    role: UserRole.Technician;
}

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
};

export type Job = {
    id: string;
    customerId: string;
    technicianId: string;
    schedule: {
        start: Date;
        end: Date;
    };
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
    details: {
        serviceType: string;
    }
}

export type Invoice = {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    issueDate: Date;
    dueDate: Date;
}
