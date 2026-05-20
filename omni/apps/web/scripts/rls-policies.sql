-- RLS Policies for Omni Marketplace
-- This script enables Row Level Security on all tables

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user ID from auth_users via email
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
  -- Try to get user from current session
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

-- Set current user ID (called from API middleware)
CREATE OR REPLACE FUNCTION auth.set_current_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::TEXT, true);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUTH_USERS POLICIES
-- ============================================

-- Users can see their own profile
CREATE POLICY auth_users_select_own
  ON auth_users FOR SELECT
  USING (id = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- Users can update their own profile
CREATE POLICY auth_users_update_own
  ON auth_users FOR UPDATE
  USING (id = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- ============================================
-- USERS (APP) POLICIES
-- ============================================

-- Anyone can create users (for signup)
CREATE POLICY users_insert_all
  ON users FOR INSERT
  WITH CHECK (true);

-- Users can see their own profile
CREATE POLICY users_select_own
  ON users FOR SELECT
  USING (id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
         OR id IN (SELECT user_id FROM vendors 
                   WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID));

-- Users can update their own profile
CREATE POLICY users_update_own
  ON users FOR UPDATE
  USING (id = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- ============================================
-- VENDORS POLICIES
-- ============================================

-- Anyone can see vendors (public data for map/search)
CREATE POLICY vendors_select_all
  ON vendors FOR SELECT
  USING (true);

-- Only vendor owners can insert vendors
CREATE POLICY vendors_insert_owner
  ON vendors FOR INSERT
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
    OR user_id IS NULL  -- Allow null for initial setup
  );

-- Only vendor owners can update
CREATE POLICY vendors_update_owner
  ON vendors FOR UPDATE
  USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- Only vendor owners can delete
CREATE POLICY vendors_delete_owner
  ON vendors FOR DELETE
  USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Anyone can see products (public data)
CREATE POLICY products_select_all
  ON products FOR SELECT
  USING (true);

-- Only vendor owners can insert products
CREATE POLICY products_insert_owner
  ON products FOR INSERT
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
    )
  );

-- Only vendor owners can update their products
CREATE POLICY products_update_owner
  ON products FOR UPDATE
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
    )
  );

-- Only vendor owners can delete their products
CREATE POLICY products_delete_owner
  ON products FOR DELETE
  USING (
    vendor_id IN (
      SELECT id FROM vendors 
      WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
    )
  );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can only see their own messages (sent or received)
CREATE POLICY messages_select_own
  ON messages FOR SELECT
  USING (
    sender_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
    OR receiver_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID
  );

-- Users can only send messages as themselves
CREATE POLICY messages_insert_own
  ON messages FOR INSERT
  WITH CHECK (sender_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- Users can only update messages they sent
CREATE POLICY messages_update_own
  ON messages FOR UPDATE
  USING (sender_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- Users can only delete messages they sent
CREATE POLICY messages_delete_own
  ON messages FOR DELETE
  USING (sender_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- ============================================
-- AUTH_ACCOUNTS POLICIES
-- ============================================

-- Users can see their own accounts
CREATE POLICY auth_accounts_select_own
  ON auth_accounts FOR SELECT
  USING ("userId" = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- Users can update their own accounts
CREATE POLICY auth_accounts_update_own
  ON auth_accounts FOR UPDATE
  USING ("userId" = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- ============================================
-- AUTH_SESSIONS POLICIES
-- ============================================

-- Users can see their own sessions
CREATE POLICY auth_sessions_select_own
  ON auth_sessions FOR SELECT
  USING ("userId" = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- Users can delete their own sessions
CREATE POLICY auth_sessions_delete_own
  ON auth_sessions FOR DELETE
  USING ("userId" = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

-- ============================================
-- VERIFICATION TOKENS (no policies - system managed)
-- ============================================

-- ============================================
-- DROP POLICIES (for reset)
-- ============================================

/*
-- To drop all policies and disable RLS:
DROP POLICY IF EXISTS auth_users_select_own ON auth_users;
DROP POLICY IF EXISTS auth_users_update_own ON auth_users;
DROP POLICY IF EXISTS users_insert_all ON users;
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS vendors_select_all ON vendors;
DROP POLICY IF EXISTS vendors_insert_owner ON vendors;
DROP POLICY IF EXISTS vendors_update_owner ON vendors;
DROP POLICY IF EXISTS vendors_delete_owner ON vendors;
DROP POLICY IF EXISTS products_select_all ON products;
DROP POLICY IF EXISTS products_insert_owner ON products;
DROP POLICY IF EXISTS products_update_owner ON products;
DROP POLICY IF EXISTS products_delete_owner ON products;
DROP POLICY IF EXISTS messages_select_own ON messages;
DROP POLICY IF EXISTS messages_insert_own ON messages;
DROP POLICY IF EXISTS messages_update_own ON messages;
DROP POLICY IF EXISTS messages_delete_own ON messages;
DROP POLICY IF EXISTS auth_accounts_select_own ON auth_accounts;
DROP POLICY IF EXISTS auth_accounts_update_own ON auth_accounts;
DROP POLICY IF EXISTS auth_sessions_select_own ON auth_sessions;
DROP POLICY IF EXISTS auth_sessions_delete_own ON auth_sessions;

ALTER TABLE auth_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
*/
