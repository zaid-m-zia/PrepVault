-- Notifications dedupe + schema compatibility migration
-- Run this in Supabase SQL Editor.

-- 1) Align legacy column names with current app schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'related_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'entity_id'
  ) THEN
    ALTER TABLE public.notifications RENAME COLUMN related_id TO entity_id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'is_read'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'read'
  ) THEN
    ALTER TABLE public.notifications RENAME COLUMN is_read TO "read";
  END IF;
END
$$;

-- 2) Ensure read is non-null and defaults to false
ALTER TABLE public.notifications
  ALTER COLUMN "read" SET DEFAULT false;

UPDATE public.notifications
SET "read" = false
WHERE "read" IS NULL;

-- 3) Remove duplicate notifications for same logical entity
-- Keep newest row by created_at/id.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, type, entity_id
      ORDER BY created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.notifications
  WHERE entity_id IS NOT NULL
)
DELETE FROM public.notifications n
USING ranked r
WHERE n.id = r.id
  AND r.rn > 1;

-- 4) Enforce dedupe at DB level (only when entity_id is present)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_unique_user_type_entity
  ON public.notifications(user_id, type, entity_id)
  WHERE entity_id IS NOT NULL;

-- 5) Indexes for unread count and feed ordering
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON public.notifications(user_id, "read");

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
  ON public.notifications(user_id, created_at DESC);
