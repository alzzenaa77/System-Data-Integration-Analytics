-- Migration: Add clarification_submitted column to fee_data and cross_division_data
-- Run this once against your database

ALTER TABLE fee_data
  ADD COLUMN IF NOT EXISTS clarification_submitted BOOLEAN DEFAULT FALSE;

ALTER TABLE cross_division_data
  ADD COLUMN IF NOT EXISTS clarification_submitted BOOLEAN DEFAULT FALSE;
