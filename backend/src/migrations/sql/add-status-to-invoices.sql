-- Add status column to invoices table
DO $$
BEGIN
    -- Create ENUM type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_invoices_status') THEN
        CREATE TYPE enum_invoices_status AS ENUM('pending', 'paid', 'overdue', 'cancelled');
    END IF;
    
    -- Add column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'status') THEN
        ALTER TABLE invoices ADD COLUMN status enum_invoices_status NOT NULL DEFAULT 'pending';
    END IF;
END$$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'invoices' AND column_name = 'status';
