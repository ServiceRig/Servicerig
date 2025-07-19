
/**
 * @fileoverview This file contains the Firebase Functions for QuickBooks integration.
 *
 * It includes functions for:
 * - OAuth2 authentication flow (redirect and callback).
 * - A callable function to trigger an invoice sync to QuickBooks.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import QuickBooks from "node-quickbooks";
import { defineSecret } from "firebase-functions/params";

// It's recommended to store these in environment variables or secrets manager
const qboConsumerKey = defineSecret("QBO_CONSUMER_KEY");
const qboConsumerSecret = defineSecret("QBO_CONSUMER_SECRET");

// Initialize Firebase Admin SDK
// This is typically done once in your main index.ts, but shown here for clarity
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();


/**
 * The main function to handle syncing an invoice to QuickBooks.
 * This is a placeholder and would need to be implemented fully.
 */
export const syncInvoiceToQuickBooks = functions.https.onCall(async (data, context) => {
    // 1. Check for user authentication
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const userId = context.auth.uid;
    const { invoiceId } = data;
    if (!invoiceId) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with an 'invoiceId'.");
    }

    functions.logger.log(`Starting QuickBooks sync for invoice ${invoiceId} by user ${userId}`);

    try {
        // 2. Fetch the invoice from Firestore
        const invoiceRef = db.collection("invoices").doc(invoiceId);
        const invoiceDoc = await invoiceRef.get();
        if (!invoiceDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Invoice not found.");
        }
        const invoiceData = invoiceDoc.data();

        // In a real implementation:
        // 3. Fetch the user's QBO tokens from Firestore
        // 4. Initialize the QuickBooks SDK with the tokens
        // 5. Map the ServiceRig customer to a QuickBooks customer (create if not exists)
        // 6. Map ServiceRig line items to QuickBooks products/services
        // 7. Create/update the invoice in QuickBooks
        // 8. Update the invoice's sync status in Firestore

        // Placeholder for the sync logic
        functions.logger.log("Simulating sync logic for invoice:", invoiceData);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call delay

        // On success, update Firestore
        await invoiceRef.update({
            "quickbooksSync.status": "synced",
            "quickbooksSync.lastSync": admin.firestore.FieldValue.serverTimestamp(),
            "quickbooksSync.error": null,
        });

        functions.logger.log(`Successfully synced invoice ${invoiceId} to QuickBooks.`);
        return { success: true, message: `Invoice ${invoiceId} synced successfully.` };

    } catch (error: any) {
        functions.logger.error(`Error syncing invoice ${invoiceId}:`, error);
        
        // Update Firestore with the error status
        await db.collection("invoices").doc(invoiceId).update({
            "quickbooksSync.status": "error",
            "quickbooksSync.lastSync": admin.firestore.FieldValue.serverTimestamp(),
            "quickbooksSync.error": error.message || "An unknown error occurred.",
        });

        throw new functions.https.HttpsError("unknown", "Failed to sync invoice.", {
            originalError: error.message,
        });
    }
});


/**
 * Redirects the user to the QuickBooks authorization URL.
 * This is the first step in the OAuth2 flow.
 */
export const qboAuthRedirect = functions.https.onRequest(async (req, res) => {
    // This is a placeholder. A full implementation would use the node-quickbooks
    // library to generate the authorization URI.
    const authUri = "https://appcenter.intuit.com/connect/oauth2?client_id=YOUR_CLIENT_ID&scope=com.intuit.quickbooks.accounting&redirect_uri=YOUR_REDIRECT_URI&response_type=code&state=your_secure_state";
    
    functions.logger.log("Redirecting user to QuickBooks for authorization.");
    res.redirect(authUri);
});

/**
 * Handles the callback from QuickBooks after the user grants authorization.
 * This is the second step in the OAuth2 flow.
 */
export const qboAuthCallback = functions.https.onRequest(async (req, res) => {
    // This is a placeholder. A full implementation would:
    // 1. Get the authorization code from the request query.
    // 2. Exchange the code for an access token and refresh token.
    // 3. Securely save these tokens in Firestore, associated with the user.
    
    const authCode = req.query.code;
    const realmId = req.query.realmId; // The company ID
    
    functions.logger.log(`Received QBO callback with auth code for realm ${realmId}.`);
    
    if (!authCode) {
        res.status(400).send("Authorization code not found.");
        return;
    }
    
    // Here you would use the SDK to exchange the code for tokens
    // and save them to the database.
    
    res.send("QuickBooks connected successfully! You can close this window.");
});
