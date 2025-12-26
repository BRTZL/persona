-- Migration: Add cascade deletion and improve RLS policies
-- This ensures proper cleanup when users are deleted and explicit security policies

-- ============================================================================
-- PART 1: CASCADE DELETION
-- ============================================================================

-- Conversations: Add ON DELETE CASCADE for user_id
-- First, find and drop the existing foreign key constraint
ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;

ALTER TABLE conversations
  ADD CONSTRAINT conversations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Favorite Characters: Add ON DELETE CASCADE for user_id
ALTER TABLE favorite_characters
  DROP CONSTRAINT IF EXISTS favorite_characters_user_id_fkey;

ALTER TABLE favorite_characters
  ADD CONSTRAINT favorite_characters_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PART 2: IMPROVE RLS POLICIES
-- ============================================================================
-- Replace "for all" policies with explicit policies for each operation
-- This provides clearer security boundaries and better auditability

-- -----------------------------------------------------------------------------
-- Conversations Table
-- -----------------------------------------------------------------------------

-- Drop existing policy
DROP POLICY IF EXISTS "Users own conversations" ON conversations;

-- SELECT: Users can only view their own conversations
CREATE POLICY "conversations_select_own"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only create conversations for themselves
CREATE POLICY "conversations_insert_own"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own conversations
CREATE POLICY "conversations_update_own"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own conversations
CREATE POLICY "conversations_delete_own"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Messages Table
-- -----------------------------------------------------------------------------

-- Drop existing policy
DROP POLICY IF EXISTS "Users access own messages" ON messages;

-- SELECT: Users can only view messages in their own conversations
CREATE POLICY "messages_select_own"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- INSERT: Users can only add messages to their own conversations
CREATE POLICY "messages_insert_own"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- UPDATE: Users can only update messages in their own conversations
CREATE POLICY "messages_update_own"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- DELETE: Users can only delete messages in their own conversations
CREATE POLICY "messages_delete_own"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- Favorite Characters Table
-- -----------------------------------------------------------------------------

-- Drop existing policy
DROP POLICY IF EXISTS "Users own favorites" ON favorite_characters;

-- SELECT: Users can only view their own favorites
CREATE POLICY "favorites_select_own"
  ON favorite_characters FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only create favorites for themselves
CREATE POLICY "favorites_insert_own"
  ON favorite_characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own favorites
CREATE POLICY "favorites_update_own"
  ON favorite_characters FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own favorites
CREATE POLICY "favorites_delete_own"
  ON favorite_characters FOR DELETE
  USING (auth.uid() = user_id);
