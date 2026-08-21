-- Migration: Add signature_data column to document_signatories table
-- This stores the base64-encoded signature image for ID card signatories

ALTER TABLE document_signatories
ADD COLUMN IF NOT EXISTS signature_data TEXT DEFAULT '';

-- Ensure the id_card signatories exist with default empty entries
INSERT INTO document_signatories (document_type, role_key, full_name, title, designation, signature_data)
VALUES 
  ('id_card', 'osca_head', '', 'OSCA Head', 'Office for Senior Citizens Affairs', ''),
  ('id_card', 'municipal_mayor', '', 'Municipal Mayor', 'Local Chief Executive', '')
ON CONFLICT (document_type, role_key) DO NOTHING;
