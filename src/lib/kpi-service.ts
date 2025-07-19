
import { mockData } from "./mock-data";
import { Job, Invoice, Estimate, Customer } from "./types";

// --- Helper Functions ---
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
};

// --- Data Fetching Simulation ---
// In a real app, these functions would fetch data from Firestore
// and could accept date ranges for filtering.
async function getInvoices(): Promise<Invoice[]> {
    return mockData.invoices;
}

async function getJobs(): Promise<Job[]> {
    return mockData.jobs;
}

async function getEstimates(): Promise<Estimate[]> {
    return mockData.estimates;
}

async function getCustomers(): Promise<Customer[]> {
    return mockData.customers;
}


// --- KPI Calculation Logic ---

export interface KpiResult {
    value: string;
    change: string;
}

export interface CalculatedKpis {
    totalRevenue: KpiResult;
    directExpenses: KpiResult;
    grossProfit: KpiResult;
    netProfitMargin: KpiResult;
    closeRate: KpiResult;
    avgInvoiceValue: KpiResult;
    customerLifetimeValue: KpiResult;
    recurringRevenue: KpiResult;
    firstTimeFixRate: KpiResult;
    jobsPerDayPerTech: KpiResult;
    repeatCustomerRate: KpiResult;
    onTimeArrivalRate: KpiResult;
    avgJobDuration: KpiResult;
    avgTravelTime: KpiResult;
    revenuePerTech: KpiResult;
    jobsPerTechPerWeek: KpiResult;
    billableUtilization: KpiResult;
    upsellRate: KpiResult;
}

export async function calculateAllKpis(): Promise<CalculatedKpis> {
    const invoices = await getInvoices();
    const jobs = await getJobs();
    const estimates = await getEstimates();
    const customers = await getCustomers();

    // --- Profitability ---
    const totalRevenue = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
    const directExpenses = totalRevenue * 0.55; // Placeholder for cost of goods sold
    const grossProfit = totalRevenue - directExpenses;
    const netProfitMargin = totalRevenue > 0 ? (grossProfit * 0.4) / totalRevenue : 0; // Placeholder for net profit

    // --- Revenue & Conversion ---
    const acceptedEstimates = estimates.filter(e => e.status === 'accepted').length;
    const closeRate = estimates.length > 0 ? acceptedEstimates / estimates.length : 0;
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
    const avgInvoiceValue = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;
    const customerLifetimeValue = customers.length > 0 ? totalRevenue / customers.length : 0;
    const recurringRevenue = 0.15; // Placeholder

    // --- Operational Efficiency ---
    const jobsPerDayPerTech = 3.8; // Placeholder
    const repeatCustomerRate = 0.55; // Placeholder
    const onTimeArrivalRate = 0.97; // Placeholder
    const totalDurationMinutes = jobs.reduce((sum, job) => sum + job.duration, 0);
    const avgJobDuration = jobs.length > 0 ? totalDurationMinutes / jobs.length : 0;


    // --- Technician Performance ---
    const numTechnicians = mockData.technicians.length;
    const revenuePerTech = numTechnicians > 0 ? totalRevenue / numTechnicians : 0;
    const jobsPerTechPerWeek = numTechnicians > 0 ? jobs.length / numTechnicians : 0;

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    return {
        totalRevenue: { value: formatCurrency(totalRevenue), change: '+20.1% vs last period' },
        directExpenses: { value: formatCurrency(directExpenses), change: 'Includes labor & materials' },
        grossProfit: { value: formatCurrency(grossProfit), change: `${formatPercentage(totalRevenue > 0 ? grossProfit/totalRevenue : 0)} margin` },
        netProfitMargin: { value: formatPercentage(netProfitMargin), change: 'After all expenses' },
        closeRate: { value: formatPercentage(closeRate), change: `${acceptedEstimates} of ${estimates.length} estimates` },
        avgInvoiceValue: { value: formatCurrency(avgInvoiceValue), change: `from ${paidInvoices.length} invoices` },
        customerLifetimeValue: { value: formatCurrency(customerLifetimeValue), change: `across ${customers.length} customers` },
        recurringRevenue: { value: formatPercentage(recurringRevenue), change: 'from service agreements' },
        firstTimeFixRate: { value: '92%', change: '+3% vs last period' }, // Placeholder
        jobsPerDayPerTech: { value: jobsPerDayPerTech.toFixed(1), change: 'Target: 4.0' },
        repeatCustomerRate: { value: formatPercentage(repeatCustomerRate), change: 'Healthy retention' },
        onTimeArrivalRate: { value: formatPercentage(onTimeArrivalRate), change: 'Slightly down from 98%' },
        avgJobDuration: { value: `${Math.floor(avgJobDuration / 60)}h ${Math.round(avgJobDuration % 60)}m`, change: 'across all jobs' },
        avgTravelTime: { value: '25 mins', change: '-5 mins vs last period' }, // Placeholder
        revenuePerTech: { value: formatCurrency(revenuePerTech), change: `avg over ${numTechnicians} techs` },
        jobsPerTechPerWeek: { value: jobsPerTechPerWeek.toFixed(1), change: 'Target: 20' },
        billableUtilization: { value: '85%', change: 'Target: 90%' }, // Placeholder
        upsellRate: { value: '12%', change: 'Avg addon: $150' }, // Placeholder
    };
}
