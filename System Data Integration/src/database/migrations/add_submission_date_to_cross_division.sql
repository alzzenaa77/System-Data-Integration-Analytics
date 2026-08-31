-- Migration: Add submission_date to cross_division_data table
-- Date: 2026-02-13

-- Add submission_date column
ALTER TABLE cross_division_data 
ADD COLUMN IF NOT EXISTS submission_date DATE;

-- Update existing records with created_at date as default
UPDATE cross_division_data 
SET submission_date = created_at::DATE 
WHERE submission_date IS NULL;

-- Make submission_date NOT NULL after setting defaults
ALTER TABLE cross_division_data 
ALTER COLUMN submission_date SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_cross_division_submission_date 
ON cross_division_data(submission_date);

-- Add comment
COMMENT ON COLUMN cross_division_data.submission_date IS 'Date when the cross-division data was submitted';
