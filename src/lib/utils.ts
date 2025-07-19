import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Estimate, Invoice } from "./types";

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
    case 'overdue':
      return 'bg-red-500 hover:bg-red-600 text-white';
    case 'sent':
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    case 'draft':
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};
