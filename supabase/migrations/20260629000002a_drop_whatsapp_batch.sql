-- Drop the function with the old signature to allow changing return type
DROP FUNCTION IF EXISTS public.crm_get_unsent_whatsapp_batch(UUID, JSONB, INT) CASCADE;
