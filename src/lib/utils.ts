
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Estimate, Invoice, Job, ServiceAgreement, ChangeOrder } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getEstimateStatusStyles = (status: Estimate['status']) => {
  switch (status) {
    case 'sent':
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    case 'accepted':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'rejected':
      return 'bg-red-500 hover:bg-red-600 text-white';
    case 'draft':
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

export const getInvoiceStatusStyles = (status: Invoice['status']) => {
  switch (status) {
    case 'paid':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'partially_paid':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    case 'pending_review':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
    case 'overdue':
      return 'bg-red-500 hover:bg-red-600 text-white';
    case 'refunded':
      return 'bg-purple-500 hover:bg-purple-600 text-white';
    case 'credited':
      return 'bg-indigo-500 hover:bg-indigo-600 text-white';
    case 'sent':
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    case 'draft':
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

export const getJobStatusStyles = (status: Job['status']) => {
  switch (status) {
    case 'in_progress':
    case 'started':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    case 'complete':
    case 'invoiced':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'scheduled':
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    case 'unscheduled':
    case 'on_hold':
    case 'awaiting_parts':
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

export const getServiceAgreementStatusStyles = (status: ServiceAgreement['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'paused':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    case 'cancelled':
    case 'expired':
      return 'bg-red-500 hover:bg-red-600 text-white';
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

export const getChangeOrderStatusStyles = (status: ChangeOrder['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'invoiced':
      case 'completed': return 'bg-blue-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'pending_approval': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
}
