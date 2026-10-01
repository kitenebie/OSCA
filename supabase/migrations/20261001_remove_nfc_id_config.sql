-- NFC is no longer supported for OSCA ID cards.
-- Remove the obsolete configurable NFC label from existing deployments.
DELETE FROM id_card_config
WHERE field_key = 'back_nfc_label';
