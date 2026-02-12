-- Rollback: Remove extracted_text column from documents table
-- This script removes the extracted_text column and its index

-- Drop the index first
DROP INDEX IF EXISTS idx_documents_extracted_text;

-- Drop the column
ALTER TABLE documents 
DROP COLUMN IF EXISTS extracted_text;

-- Verify the column was removed
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name = 'extracted_text';

-- This should return 0 rows if successful
