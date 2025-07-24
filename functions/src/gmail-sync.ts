
/**
 * @fileoverview Firebase Functions for Gmail to Unscheduled Job integration.
 *
 * This file includes the necessary logic for:
 * - Google OAuth 2.0 authentication flow to read a user's Gmail inbox.
 * - Securely storing and refreshing user tokens in Firestore.
 * - A scheduled function to poll a specified email address for new leads.
 * - Parsing email content and creating new, unscheduled jobs in Firestore.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import { defineSecret } from "firebase-functions/params";

// Define required secrets for Google OAuth
const googleClientId = defineSecret("GOOGLE_CLIENT_ID");
const googleClientSecret = defineSecret("GOOGLE_CLIENT_SECRET");

// Scopes required for the Gmail API (read-only is sufficient)
const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// Initialize Firebase Admin SDK if not already done
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();

/**
 * Creates and configures a Google OAuth2 client for Gmail.
 * @return {google.auth.OAuth2} An OAuth2 client instance.
 */
function getGmailOauthClient() {
    const functionsHost = 'https://us-central1-your-project-id.cloudfunctions.net'; // Replace with your actual project ID or dynamic host
    const redirectUri = `${functionsHost}/gmailAuthCallback`;
    
    return new google.auth.OAuth2(
        googleClientId.value(),
        googleClientSecret.value(),
        redirectUri
    );
}

/**
 * HTTP function that starts the OAuth flow for Gmail access.
 */
export const gmailAuthRedirect = functions
    .runWith({ secrets: [googleClientId, googleClientSecret] })
    .https.onRequest((req, res) => {
        const { userId } = req.query;
        if (!userId || typeof userId !== "string") {
            res.status(400).send("Missing 'userId' query parameter.");
            return;
        }

        const oauth2Client = getGmailOauthClient();
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: GMAIL_SCOPES,
            state: userId,
            prompt: "consent",
        });

        functions.logger.log("Redirecting to Google for Gmail auth for user:", userId);
        res.redirect(authUrl);
    });

/**
 * HTTP function that handles the callback from the Gmail OAuth flow.
 */
export const gmailAuthCallback = functions
    .runWith({ secrets: [googleClientId, googleClientSecret] })
    .https.onRequest(async (req, res) => {
        const { code, state } = req.query;
        const userId = state as string;

        if (!code || typeof code !== "string" || !userId) {
            res.status(400).send("Missing code or state from Google OAuth callback.");
            return;
        }

        const oauth2Client = getGmailOauthClient();

        try {
            const { tokens } = await oauth2Client.getToken(code);
            // Store tokens securely in a dedicated settings collection
            await db.collection("settings").doc("gmail").set({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: admin.firestore.Timestamp.fromMillis(tokens.expiry_date!),
                scope: tokens.scope,
                authorizedUserId: userId,
            });

            functions.logger.log("Successfully stored Gmail tokens for the organization.");
            res.send("Gmail account connected successfully for lead generation! You can close this window.");

        } catch (error: any) {
            functions.logger.error("Error exchanging auth code for Gmail tokens:", error.message);
            res.status(500).send("Failed to connect Gmail account.");
        }
    });

/**
 * Scheduled function to check for new lead emails and create jobs.
 * This function should be triggered by a Cloud Scheduler job (e.g., every 5 minutes).
 */
export const checkForNewLeads = functions
    .runWith({ secrets: [googleClientId, googleClientSecret] })
    .pubsub.schedule("every 5 minutes").onRun(async (context) => {
    
    functions.logger.log("Running scheduled job check for new email leads.");

    // 1. Fetch the stored Gmail settings and tokens
    const gmailSettingsRef = db.collection("settings").doc("gmail");
    const gmailSettingsDoc = await gmailSettingsRef.get();

    if (!gmailSettingsDoc.exists || !gmailSettingsDoc.data()?.refreshToken) {
        functions.logger.log("Gmail integration not configured or refresh token missing. Skipping check.");
        return null;
    }
    const settings = gmailSettingsDoc.data()!;

    // 2. Initialize Gmail API client
    const oauth2Client = getGmailOauthClient();
    oauth2Client.setCredentials({ refresh_token: settings.refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // 3. Search for new, unread emails from the lead source
    // In a real app, this query would be configurable from the settings UI.
    const leadSourceEmail = "dispatch@leadsource.com"; // Placeholder
    const query = `from:${leadSourceEmail} is:unread`;

    try {
        const listResponse = await gmail.users.messages.list({
            userId: "me",
            q: query,
        });

        const messages = listResponse.data.messages;
        if (!messages || messages.length === 0) {
            functions.logger.log("No new leads found.");
            return null;
        }

        functions.logger.log(`Found ${messages.length} new potential leads.`);

        for (const message of messages) {
            if (!message.id) continue;
            // 4. Fetch the full email content
            const messageResponse = await gmail.users.messages.get({
                userId: "me",
                id: message.id,
            });
            
            // 5. Parse email content (this is a placeholder for complex parsing logic)
            const subject = messageResponse.data.payload?.headers?.find(h => h.name === 'Subject')?.value;
            const bodySnippet = messageResponse.data.snippet;
            
            // Example parsing logic - a real implementation would be more robust
            const customerName = subject?.split('for ')[1] || 'Unknown Customer';
            const description = bodySnippet;

            // 6. Create a new job in Firestore
            const newJob = {
                title: `New Lead: ${subject || 'From Email'}`,
                description: `Parsed from email snippet: ${description}`,
                status: 'unscheduled',
                customerId: '', // Would need to find or create customer
                technicianId: '',
                schedule: { start: new Date(), end: new Date(), multiDay: false, unscheduled: true },
                duration: 60, // Default duration
                details: { serviceType: 'Lead', trade: 'Other', category: 'Lead' },
                createdFrom: 'email',
                emailId: message.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            const jobRef = await db.collection('jobs').add(newJob);
            functions.logger.log(`Created new unscheduled job ${jobRef.id} from email ${message.id}.`);
            
            // 7. Mark the email as read to prevent re-processing
            await gmail.users.messages.modify({
                userId: 'me',
                id: message.id,
                requestBody: {
                    removeLabelIds: ['UNREAD']
                }
            });
        }
    } catch (error) {
        functions.logger.error("Error checking for new leads:", error);
    }
    
    return null;
});
