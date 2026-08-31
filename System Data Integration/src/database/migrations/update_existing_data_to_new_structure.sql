-- Migration: Update existing data to new 16-field structure
-- Date: 2026-02-13
-- Purpose: Convert old 8-field fee_data to new 16-field structure

-- Step 1: Add new columns if they don't exist (already done in previous migration)
-- This migration assumes the schema has been updated with new columns

-- Step 2: Update existing fee_data records with default values
-- Map old fields to new structure
UPDATE fee_data 
SET 
  -- Identitas Pengisi (use contributor info as default)
  submitter_name = COALESCE(submitter_name, 
    (SELECT full_name FROM users WHERE id = fee_data.contributor_id)),
  submitter_division = COALESCE(submitter_division, 'Unknown Division'),
  submitter_input_date = COALESCE(submitter_input_date, created_at::DATE),
  
  -- Identitas (map from old 'source' field)
  service_provider = COALESCE(service_provider, 
    CASE 
      WHEN source IS NOT NULL THEN source
      ELSE 'Unknown Provider'
    END),
  service_recipient = COALESCE(service_recipient, 'Unknown Recipient'),
  
  -- Detail Jasa (keep service_type, add defaults for new fields)
  scope_of_work = COALESCE(scope_of_work, 
    CASE 
      WHEN description IS NOT NULL THEN description
      ELSE 'Scope not specified'
    END),
  tax_year = COALESCE(tax_year, 
    CASE 
      WHEN date IS NOT NULL THEN EXTRACT(YEAR FROM date)::TEXT
      ELSE EXTRACT(YEAR FROM created_at)::TEXT
    END),
  
  -- Financial Data
  financial_type = COALESCE(financial_type, 'Professional Fee'),
  financial_description = COALESCE(financial_description, 
    CASE 
      WHEN description IS NOT NULL THEN description
      ELSE 'Financial details not specified'
    END),
  fee_scheme = COALESCE(fee_scheme, 'Fixed Fee'),
  financial_date = COALESCE(financial_date, 
    CASE 
      WHEN date IS NOT NULL THEN date
      ELSE created_at::DATE
    END)
WHERE submitter_name IS NULL OR service_provider IS NULL;

-- Step 3: Update cross_division_data with submission_date
UPDATE cross_division_data 
SET submission_date = COALESCE(submission_date, created_at::DATE)
WHERE submission_date IS NULL;

-- Step 4: Verify the update
DO $$
DECLARE
  fee_count INTEGER;
  cross_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fee_count FROM fee_data WHERE submitter_name IS NOT NULL;
  SELECT COUNT(*) INTO cross_count FROM cross_division_data WHERE submission_date IS NOT NULL;
  
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Fee data records updated: %', fee_count;
  RAISE NOTICE 'Cross-division data records updated: %', cross_count;
END $$;

-- Step 5: Drop old columns if they exist (optional - uncomment if you want to remove old fields)
-- ALTER TABLE fee_data DROP COLUMN IF EXISTS source;
-- ALTER TABLE fee_data DROP COLUMN IF EXISTS date;
-- ALTER TABLE fee_data DROP COLUMN IF EXISTS description;

COMMENT ON TABLE fee_data IS 'Fee competitor data with 16-field structure (updated 2026-02-13)';
COMMENT ON TABLE cross_division_data IS 'Cross-division data with submission_date (updated 2026-02-13)';
