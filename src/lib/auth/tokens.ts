
'use server';

import jwt from 'jsonwebtoken';

const getSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.warn("JWT_SECRET is not set. Using a default, insecure secret for development. Please set this in your .env file for production.");
        return 'default_dev_secret_please_change';
    }
    return secret;
};

/**
 * Creates a short-lived JWT for accessing a specific invoice.
 * @param invoiceId - The ID of the invoice to grant access to.
 * @returns A JWT token string.
 */
export async function createInvoiceToken(invoiceId: string): Promise<string> {
  const secret = getSecret();
  const payload = { 
    sub: invoiceId, // Subject of the token is the invoice ID
    aud: 'invoice_viewer', // Audience claim
  };
  const token = jwt.sign(payload, secret, { expiresIn: '24h' }); // Token is valid for 24 hours
  return token;
}

/**
 * Verifies a JWT and checks if it's valid for the given invoice.
 * @param token - The JWT from the client.
 * @param invoiceId - The ID of the invoice being accessed.
 * @returns True if the token is valid, false otherwise.
 */
export async function verifyInvoiceToken(token: string, invoiceId: string): Promise<boolean> {
  const secret = getSecret();
  try {
    const decoded = jwt.verify(token, secret) as { sub: string, aud: string };
    
    // Check if the token subject matches the invoice ID and the audience is correct
    if (decoded.sub === invoiceId && decoded.aud === 'invoice_viewer') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}
