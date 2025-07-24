
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
function getOauthClient(req: functions.Request) {
    const redirectUri = `https://${req.hostname}/googleCalendarAuthCallback`;
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

        const oauth2Client = getOauthClient(req);
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

        const oauth2Client = getOauthClient(req);

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
export const syncToGoogleCalendar = functions.https.onCall(async (data, context) => {
    // Placeholder for syncing logic
    const { jobId } = data;
    const userId = context.auth?.uid;

    if (!userId) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    if (!jobId) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a 'jobId'.");
    }

    functions.logger.log(`Placeholder sync for job ${jobId} by user ${userId}`);
    // In a full implementation:
    // 1. Fetch user's Google tokens from Firestore.
    // 2. Initialize OAuth client and refresh token if necessary.
    // 3. Fetch job details from Firestore.
    // 4. Format job details into a Google Calendar event object.
    // 5. Use google.calendar('v3').events.insert() to create the event.
    // 6. Store the returned Google event ID back in the ServiceRig job document.

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    return { success: true, message: `Job ${jobId} sync placeholder executed.` };
});
