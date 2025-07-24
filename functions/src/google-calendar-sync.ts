
/**
 * @fileoverview Firebase Functions for Google Calendar two-way synchronization.
 *
 * This file includes the necessary logic for:
 * - Google OAuth 2.0 authentication flow (redirect and callback) to get user permissions.
 * - Securely storing and refreshing user tokens in Firestore.
 * - A callable function to trigger the synchronization of a ServiceRig job to Google Calendar.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import { defineSecret } from "firebase-functions/params";
import type { Job } from '../../src/lib/types';


// Define required secrets for Google OAuth
const googleClientId = defineSecret("GOOGLE_CLIENT_ID");
const googleClientSecret = defineSecret("GOOGLE_CLIENT_SECRET");

// Initialize Firebase Admin SDK if not already done
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();

// Scopes required for the Google Calendar API
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

/**
 * Creates and configures a Google OAuth2 client.
 * @param {functions.Request} req - The function's request object to build the redirect URI.
 * @return {google.auth.OAuth2} An OAuth2 client instance.
 */
function getOauthClient() {
    // In a real production app, the hostname should be dynamically determined
    // or configured via environment variables.
    const hostname = "localhost:9199"; // Placeholder for local testing
    const redirectUri = `http://${hostname}/googleCalendarAuthCallback`;
    
    return new google.auth.OAuth2(
        googleClientId.value(),
        googleClientSecret.value(),
        redirectUri
    );
}

/**
 * HTTP function that starts the OAuth flow by redirecting the user to Google's consent screen.
 */
export const googleCalendarAuthRedirect = functions
    .runWith({ secrets: [googleClientId, googleClientSecret] })
    .https.onRequest((req, res) => {
        // A unique identifier for the user should be passed in the state parameter
        const { userId } = req.query;
        if (!userId || typeof userId !== "string") {
            res.status(400).send("Missing or invalid 'userId' query parameter.");
            return;
        }

        const oauth2Client = getOauthClient();
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
            state: userId, // Pass the userId to identify the user in the callback
            prompt: "consent", // Ensures a refresh token is always received
        });

        functions.logger.log("Redirecting to Google for auth for user:", userId);
        res.redirect(authUrl);
    });

/**
 * HTTP function that handles the callback from the Google OAuth flow.
 */
export const googleCalendarAuthCallback = functions
    .runWith({ secrets: [googleClientId, googleClientSecret] })
    .https.onRequest(async (req, res) => {
        const { code, state } = req.query;
        const userId = state as string;

        if (!code || typeof code !== "string" || !userId) {
            res.status(400).send("Missing code or state from Google OAuth callback.");
            return;
        }

        const oauth2Client = getOauthClient();

        try {
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            // Store the tokens securely in Firestore, associated with the user
            const userTokenRef = db.collection("users").doc(userId).collection("googleTokens").doc("calendar");
            
            await userTokenRef.set({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: admin.firestore.Timestamp.fromMillis(tokens.expiry_date!),
                scope: tokens.scope,
            });

            functions.logger.log("Successfully stored Google Calendar tokens for user:", userId);
            res.send("Google Calendar connected successfully! You can close this window.");

        } catch (error: any) {
            functions.logger.error("Error exchanging auth code for tokens:", error.message);
            res.status(500).send("Failed to connect Google Calendar.");
        }
    });

/**
 * Callable function to sync a single ServiceRig job to Google Calendar.
 */
export const syncToGoogleCalendar = functions
    .runWith({ secrets: [googleClientId, googleClientSecret] })
    .https.onCall(async (data, context) => {
    
    const { jobId, userId } = data; // Assuming userId is passed for whom to sync
    
    if (!jobId || !userId) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a 'jobId' and 'userId'.");
    }

    functions.logger.log(`Starting Google Calendar sync for job ${jobId} by user ${userId}`);

    try {
        // 1. Fetch user's Google tokens from Firestore.
        const tokenRef = db.collection("users").doc(userId).collection("googleTokens").doc("calendar");
        const tokenDoc = await tokenRef.get();

        if (!tokenDoc.exists) {
            throw new functions.https.HttpsError("failed-precondition", "User has not authenticated with Google Calendar.");
        }
        const tokens = tokenDoc.data();
        if (!tokens || !tokens.refreshToken) {
            throw new functions.https.HttpsError("failed-precondition", "User is missing Google Calendar refresh token.");
        }
        
        // 2. Initialize OAuth client and refresh token if necessary.
        const oauth2Client = getOauthClient();
        oauth2Client.setCredentials({ refresh_token: tokens.refreshToken });

        // Check if the access token is expired and refresh if needed
        if (tokens.expiresAt.toMillis() < Date.now()) {
            functions.logger.log("Access token expired, refreshing...");
            const { credentials } = await oauth2Client.refreshAccessToken();
            await tokenRef.update({
                accessToken: credentials.access_token,
                expiresAt: admin.firestore.Timestamp.fromMillis(credentials.expiry_date!),
            });
            oauth2Client.setCredentials(credentials);
            functions.logger.log("Access token refreshed successfully.");
        } else {
             oauth2Client.setCredentials({
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
             });
        }

        // 3. Fetch job details from Firestore.
        const jobDoc = await db.collection("jobs").doc(jobId).get();
        if (!jobDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Job not found.");
        }
        const jobData = jobDoc.data() as Job;

        // 4. Format job details into a Google Calendar event object.
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        const event = {
            summary: `ServiceRig: ${jobData.title}`,
            description: `Customer: ${jobData.customerName || 'N/A'}\nNotes: ${jobData.description}`,
            start: {
                dateTime: new Date(jobData.schedule.start).toISOString(),
                timeZone: 'America/Chicago', // Should be dynamic in a real app
            },
            end: {
                dateTime: new Date(jobData.schedule.end).toISOString(),
                timeZone: 'America/Chicago', // Should be dynamic in a real app
            },
            // In a real app, you'd fetch customer/technician address/email
            // location: customer.address, 
            // attendees: [{ email: technician.email }],
        };

        // 5. Use google.calendar('v3').events.insert() to create/update the event.
        let googleEvent;
        if (jobData.linkedGoogleEventId) {
            // Update existing event
            functions.logger.log(`Updating existing Google event: ${jobData.linkedGoogleEventId}`);
            googleEvent = await calendar.events.update({
                calendarId: 'primary',
                eventId: jobData.linkedGoogleEventId,
                requestBody: event,
            });
        } else {
            // Insert new event
            functions.logger.log("Creating new Google event.");
            googleEvent = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            });
        }

        // 6. Store the returned Google event ID back in the ServiceRig job document.
        if (googleEvent.data.id) {
            await jobDoc.ref.update({ linkedGoogleEventId: googleEvent.data.id });
            functions.logger.log(`Successfully synced job ${jobId} to Google event ${googleEvent.data.id}`);
        }

        return { success: true, message: `Job ${jobId} synced to Google Calendar.` };

    } catch (error: any) {
        functions.logger.error(`Failed to sync job ${jobId} to Google Calendar:`, error.message);
        if (error.response?.data) {
             functions.logger.error("Google API Error:", error.response.data.error);
        }
        throw new functions.https.HttpsError("unknown", "Failed to sync to Google Calendar.", error.message);
    }
});
