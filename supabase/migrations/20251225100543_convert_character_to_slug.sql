-- Migration: Convert character_id (UUID) to character_slug (TEXT)
-- This migration moves character references from UUID-based foreign keys to slug-based strings

-- Step 1: Add character_slug column
ALTER TABLE conversations ADD COLUMN character_slug TEXT;

-- Step 2: Populate character_slug from characters table
UPDATE conversations c
SET character_slug = ch.slug
FROM characters ch
WHERE c.character_id = ch.id;

-- Step 3: Make character_slug NOT NULL after population
ALTER TABLE conversations ALTER COLUMN character_slug SET NOT NULL;

-- Step 4: Add constraint for valid slugs
ALTER TABLE conversations ADD CONSTRAINT valid_character_slug
CHECK (character_slug IN ('luna', 'nova', 'atlas', 'spark', 'zen', 'blaze', 'echo', 'pixel'));

-- Step 5: Create index on character_slug
CREATE INDEX idx_conversations_character_slug ON conversations(character_slug);

-- Step 6: Drop foreign key constraint
ALTER TABLE conversations DROP CONSTRAINT conversations_character_id_fkey;

-- Step 7: Drop old character_id column
ALTER TABLE conversations DROP COLUMN character_id;

-- Step 8: Drop characters table and its RLS policies
DROP POLICY IF EXISTS "Characters readable by authenticated" ON characters;
DROP TABLE characters;
