-- Migration: Add extracted_text column to documents table
-- This script adds a TEXT column to store extracted text from OCR/PDF parsing

-- Add the extracted_text column
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS extracted_text TEXT NULL;

-- Add partial index for faster queries (only indexes non-null values)
CREATE INDEX IF NOT EXISTS idx_documents_extracted_text 
ON documents(extracted_text) 
WHERE extracted_text IS NOT NULL;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name = 'extracted_text';

-- Check the index was created
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'documents' 
AND indexname = 'idx_documents_extracted_text';
