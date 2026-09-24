    -- ============================================================
    -- Add fingerprint scanner settings to system_settings table
    -- Run this in Supabase SQL Editor
    -- ============================================================

    -- Insert fingerprint scanner type setting
    INSERT INTO system_settings (setting_key, setting_value, setting_type, setting_label, setting_group, sort_order)
    VALUES ('fingerprint_scanner_type', 'digitalpersona', 'text', 'Fingerprint Scanner Type', 'general', 100)
    ON CONFLICT (setting_key) DO NOTHING;

    -- Endpoint is only used by ESP32; HID Web SDK discovers its own local client
    INSERT INTO system_settings (setting_key, setting_value, setting_type, setting_label, setting_group, sort_order)
    VALUES ('fingerprint_scanner_endpoint', 'hid-agent', 'text', 'Fingerprint Scanner Endpoint URL (ESP32 only)', 'general', 101)
    ON CONFLICT (setting_key) DO NOTHING;
