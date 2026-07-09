-- Migration: Add Forest Note & Card JSON fields to diary_entries
-- Date: 2026-07-09
-- Purpose: Support Forest Note GPT①・GPT② integration (Specification v1.0)

BEGIN;

-- Add 7-item life log scores (0-100 scale as per spec, but keeping 0-10 for app consistency)
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS mental SMALLINT,
ADD COLUMN IF NOT EXISTS body SMALLINT,
ADD COLUMN IF NOT EXISTS work SMALLINT,
ADD COLUMN IF NOT EXISTS relationship SMALLINT,
ADD COLUMN IF NOT EXISTS money SMALLINT,
ADD COLUMN IF NOT EXISTS habit SMALLINT,
ADD COLUMN IF NOT EXISTS dream SMALLINT;

-- Add 7-item life log text descriptions
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS mental_text TEXT,
ADD COLUMN IF NOT EXISTS body_text TEXT,
ADD COLUMN IF NOT EXISTS work_text TEXT,
ADD COLUMN IF NOT EXISTS relationship_text TEXT,
ADD COLUMN IF NOT EXISTS money_text TEXT,
ADD COLUMN IF NOT EXISTS habit_text TEXT,
ADD COLUMN IF NOT EXISTS dream_text TEXT;

-- Add keywords and meta lists
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS items TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS locations TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS activities TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS emotions TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add daily summary fields
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS today_best TEXT,
ADD COLUMN IF NOT EXISTS lesson TEXT,
ADD COLUMN IF NOT EXISTS tomorrow TEXT,
ADD COLUMN IF NOT EXISTS ai_comment TEXT;

-- Add Forest Note & Card JSON storage
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS forest_note_json JSONB,
ADD COLUMN IF NOT EXISTS image_prompt TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add Card data storage
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS card_id TEXT,
ADD COLUMN IF NOT EXISTS card_json JSONB,
ADD COLUMN IF NOT EXISTS card_image_url TEXT;

-- Add generation status flags
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS forest_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS card_generated BOOLEAN DEFAULT FALSE;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_diary_entries_forest_generated
ON diary_entries(user_id, date)
WHERE forest_generated = TRUE;

CREATE INDEX IF NOT EXISTS idx_diary_entries_card_generated
ON diary_entries(user_id, date)
WHERE card_generated = TRUE;

CREATE INDEX IF NOT EXISTS idx_diary_entries_card_id
ON diary_entries(user_id, card_id);

-- Add comments for clarity
COMMENT ON COLUMN diary_entries.mental IS 'Mental health score (0-10)';
COMMENT ON COLUMN diary_entries.body IS 'Physical health score (0-10)';
COMMENT ON COLUMN diary_entries.work IS 'Work/Study score (0-10)';
COMMENT ON COLUMN diary_entries.relationship IS 'Relationship score (0-10)';
COMMENT ON COLUMN diary_entries.money IS 'Financial score (0-10)';
COMMENT ON COLUMN diary_entries.habit IS 'Habit/Exercise score (0-10)';
COMMENT ON COLUMN diary_entries.dream IS 'Dream/Goal score (0-10)';
COMMENT ON COLUMN diary_entries.forest_note_json IS 'Forest Note JSON from GPT① (Spec v1.0)';
COMMENT ON COLUMN diary_entries.card_json IS 'Card JSON from GPT② (Spec v1.0)';
COMMENT ON COLUMN diary_entries.forest_generated IS 'Flag: Forest Note was generated';
COMMENT ON COLUMN diary_entries.card_generated IS 'Flag: Card was generated';

COMMIT;
