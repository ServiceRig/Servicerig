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

// Export all functions from the quickbooks-sync file
export const qboAuthRedirect = quickbooks.qboAuthRedirect;
export const qboAuthCallback = quickbooks.qboAuthCallback;
export const syncInvoiceToQuickBooks = quickbooks.syncInvoiceToQuickBooks;

// Export all functions from the xero-sync file
export const xeroAuthRedirect = xero.xeroAuthRedirect;
export const xeroAuthCallback = xero.xeroAuthCallback;
export const syncInvoiceToXero = xero.syncInvoiceToXero;


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
