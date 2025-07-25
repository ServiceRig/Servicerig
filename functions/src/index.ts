

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
import * as quickbooks from "./quickbooks-sync";
import * as xero from "./xero-sync";
import * as googleCalendar from "./google-calendar-sync";
import * as gmail from "./gmail-sync";

// Export all functions from the quickbooks-sync file
export const qboAuthRedirect = quickbooks.qboAuthRedirect;
export const qboAuthCallback = quickbooks.qboAuthCallback;
export const syncInvoiceToQuickBooks = quickbooks.syncInvoiceToQuickBooks;

// Export all functions from the xero-sync file
export const xeroAuthRedirect = xero.xeroAuthRedirect;
export const xeroAuthCallback = xero.xeroAuthCallback;
export const syncInvoiceToXero = xero.syncInvoiceToXero;

// Export all functions from the google-calendar-sync file
export const googleCalendarAuthRedirect = googleCalendar.googleCalendarAuthRedirect;
export const googleCalendarAuthCallback = googleCalendar.googleCalendarAuthCallback;
export const syncToGoogleCalendar = googleCalendar.syncToGoogleCalendar;
export const pollGoogleCalendar = googleCalendar.pollGoogleCalendar;

// Export all functions from the gmail-sync file
export const gmailAuthRedirect = gmail.gmailAuthRedirect;
export const gmailAuthCallback = gmail.gmailAuthCallback;
export const checkForNewLeads = gmail.checkForNewLeads;


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

