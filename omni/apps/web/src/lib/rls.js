-- RLS Helper Functions for API Routes
-- These functions help set the current user context for RLS policies

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

/**
 * Set the current user for RLS policies
 * Call this at the start of any API route that needs auth
 */
export async function setRLSUser(userId) {
  if (!userId) {
    // Clear the user context
    await sql`SELECT set_config('app.current_user_id', '', true)`;
    return;
  }
  
  await sql`SELECT set_config('app.current_user_id', ${userId}::text, true)`;
}

/**
 * Clear the current user (logout)
 */
export async function clearRLSUser() {
  await sql`SELECT set_config('app.current_user_id', '', true)`;
}

/**
 * Get current user from RLS context
 */
export async function getCurrentUserId() {
  const result = await sql`SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid as user_id`;
  return result[0]?.user_id || null;
}

/**
 * Require authentication - throws if not logged in
 */
export async function requireAuth() {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

/**
 * Check if current user owns a vendor
 */
export async function isVendorOwner(vendorId, userId) {
  const result = await sql`
    SELECT 1 FROM vendors 
    WHERE id = ${vendorId} AND user_id = ${userId}
    LIMIT 1
  `;
  return result.length > 0;
}

/**
 * Get vendor ID for current user
 */
export async function getUserVendorId(userId) {
  const result = await sql`
    SELECT id FROM vendors 
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  return result[0]?.id || null;
}
