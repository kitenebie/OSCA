-- ====================================================







-- TABLE: id_card_config







-- Stores editable text/label fields for ID Card Variants 1 & 2







-- ====================================================















DROP TABLE IF EXISTS id_card_config;















CREATE TABLE id_card_config (







  id TEXT PRIMARY KEY DEFAULT ('idc-' || extract(epoch from now())::bigint::text || '-' || floor(random() * 10000)::int::text),







  variant TEXT NOT NULL,           -- 'variant1' or 'variant2'







  field_key TEXT NOT NULL,         -- e.g. 'header_line1', 'back_benefit_1', etc.







  field_value TEXT NOT NULL DEFAULT '',







  field_label TEXT DEFAULT '',     -- Human-readable label for the config UI







  sort_order INT DEFAULT 0,







  created_at TIMESTAMPTZ DEFAULT now(),







  updated_at TIMESTAMPTZ DEFAULT now(),







  UNIQUE(variant, field_key)







);















-- Trigger for updated_at







CREATE OR REPLACE FUNCTION update_id_card_config_timestamp()







RETURNS TRIGGER AS $$







BEGIN







  NEW.updated_at = now();







  RETURN NEW;







END;







$$ language 'plpgsql';















CREATE TRIGGER update_id_card_config_updated_at







  BEFORE UPDATE ON id_card_config







  FOR EACH ROW EXECUTE FUNCTION update_id_card_config_timestamp();















-- ═══════════════════════════════════════════







-- VARIANT 1 — FRONT







-- ═══════════════════════════════════════════







INSERT INTO id_card_config (id, variant, field_key, field_value, field_label, sort_order) VALUES







('idc-v1-header1', 'variant1', 'header_line1', 'Republic of the Philippines', 'Front: Header Line 1', 1),







('idc-v1-header2', 'variant1', 'header_line2', 'Municipality of Juban', 'Front: Header Line 2', 2),







('idc-v1-header3', 'variant1', 'header_line3', 'Office for Senior Citizens Affairs', 'Front: Header Line 3', 3),







('idc-v1-badge', 'variant1', 'badge_text', 'OSCA', 'Front: Badge Label', 4),







('idc-v1-badge-sub', 'variant1', 'badge_subtitle', 'SENIOR CITIZEN', 'Front: Badge Subtitle', 5),







('idc-v1-footer', 'variant1', 'footer_text', 'OSCA — Sorsogon, Philippines', 'Front: Footer Text', 6),







('idc-v1-idlabel', 'variant1', 'id_label', 'OSCA ID No.', 'Front: ID Number Label', 7),















-- ═══════════════════════════════════════════







-- VARIANT 1 — BACK







-- ═══════════════════════════════════════════







('idc-v1-back-header', 'variant1', 'back_header', 'MUNICIPALITY OF JUBAN', 'Back: Header', 10),







('idc-v1-back-subtitle', 'variant1', 'back_subtitle', 'OSCA — Sorsogon, Philippines', 'Back: Subtitle', 11),







('idc-v1-back-ra', 'variant1', 'back_ra_title', 'BENEFITS & PRIVILEGES UNDER RA 9994', 'Back: RA Title', 12),







('idc-v1-back-b1', 'variant1', 'back_benefit_1', 'Free Medical & Dental, Diagnostic & Laboratory Services in all Government Facilities.', 'Back: Benefit Line 1', 13),







('idc-v1-back-b2', 'variant1', 'back_benefit_2', '20% discount in purchase of unbranded generic medicines, discounts in hotels, restaurants, recreation center, theatres, cinema houses & concert halls, discount in Medical & Dental, Diagnostic & Laboratory Services in all private facilities, discount fare for domestic air, sea travel and public land transportation, discount in funeral & burial services.', 'Back: Benefit Line 2', 14),







('idc-v1-back-b3', 'variant1', 'back_benefit_3', '5% discounts for regular retail price of prime necessities & prime commodities monthly utilization of water and electricity.', 'Back: Benefit Line 3', 15),







('idc-v1-back-b4', 'variant1', 'back_benefit_4', '20% discount & VAT exemption, if applicable on the sale of goods & services.', 'Back: Benefit Line 4', 16),







('idc-v1-back-b5', 'variant1', 'back_benefit_5', 'Only EXCLUSIVE USE OF SENIOR CITIZENS, abuse of privileges is punishable by law. Persons & Corporations violating RA 9994 shall be penalized.', 'Back: Warning Text', 17),







('idc-v1-back-qr', 'variant1', 'back_qr_label', 'SCAN TO VERIFY', 'Back: QR Label', 18),







('idc-v1-back-nfc', 'variant1', 'back_nfc_label', 'NFC SMART TAG', 'Back: NFC Label', 19),







('idc-v1-back-osca', 'variant1', 'back_osca_head_title', 'OSCA Head', 'Back: OSCA Head Title', 20),







('idc-v1-back-mayor', 'variant1', 'back_mayor_title', 'Municipal Mayor', 'Back: Mayor Title', 21),
('idc-v1-img-logo', 'variant1', 'img_logo', '/juban-logo.png', 'Image: Municipality Logo', 30),
('idc-v1-img-seal', 'variant1', 'img_seal', '/ph_logo.png', 'Image: PH Government Seal', 31),
('idc-v1-img-fingerprint', 'variant1', 'img_fingerprint', '/fingerprint.png', 'Image: Fingerprint Placeholder', 32);















-- ═══════════════════════════════════════════







-- VARIANT 2 — FRONT







-- ═══════════════════════════════════════════







INSERT INTO id_card_config (id, variant, field_key, field_value, field_label, sort_order) VALUES







('idc-v2-header1', 'variant2', 'header_line1', 'MUNICIPALITY OF JUBAN', 'Front: Header Line 1', 1),







('idc-v2-header2', 'variant2', 'header_line2', 'Office of Senior Citizens Affairs', 'Front: Header Line 2', 2),







('idc-v2-badge', 'variant2', 'badge_text', 'OSCA', 'Front: Badge Label', 3),







('idc-v2-badge-sub', 'variant2', 'badge_subtitle', 'SENIOR CITIZEN', 'Front: Badge Subtitle', 4),







('idc-v2-footer', 'variant2', 'footer_text', 'OSCA — Sorsogon, Philippines', 'Front: Footer Text', 5),







('idc-v2-idlabel', 'variant2', 'id_label', 'OSCA Number', 'Front: ID Number Label', 6),







('idc-v2-name', 'variant2', 'name_label', 'Senior Citizen Name', 'Front: Name Label', 7),















-- ═══════════════════════════════════════════







-- VARIANT 2 — BACK







-- ═══════════════════════════════════════════







('idc-v2-back-ra', 'variant2', 'back_ra_title', 'BENEFITS & PRIVILEGES UNDER REPUBLIC ACT NO.9994', 'Back: RA Title', 10),







('idc-v2-back-b1', 'variant2', 'back_benefit_1', 'Free Medical & Dental, Diagnostic & Laboratory Services in all Government Facilities.', 'Back: Benefit Line 1', 11),







('idc-v2-back-b2', 'variant2', 'back_benefit_2', '20% discount in purchase of unbranded generic medicines, discounts in hotels, restaurants, recreation center, theatres, cinema houses & concert halls, discount in Medical & Dental, Diagnostic & Laboratory Services in all private facilities, discount fare for domestic air, sea travel and public land transportation, discount in funeral & burial services.', 'Back: Benefit Line 2', 12),







('idc-v2-back-b3', 'variant2', 'back_benefit_3', '5% discounts for regular retail price of prime necessities & prime commodities monthly utilization of water and electricity.', 'Back: Benefit Line 3', 13),







('idc-v2-back-b4', 'variant2', 'back_benefit_4', '20% discount & VAT exemption, if applicable on the sale of goods & services.', 'Back: Benefit Line 4', 14),







('idc-v2-back-b5', 'variant2', 'back_benefit_5', 'Only EXCLUSIVE USE OF SENIOR CITIZENS, abuse of privileges is punishable by law. Persons & Corporations violating RA 9994 shall be penalized.', 'Back: Warning Text', 15),







('idc-v2-back-osca', 'variant2', 'back_osca_head_title', 'OSCA Head', 'Back: OSCA Head Title', 16),







('idc-v2-back-mayor', 'variant2', 'back_mayor_title', 'Municipal Mayor', 'Back: Mayor Title', 17),
('idc-v2-img-logo', 'variant2', 'img_logo', '/juban-logo.png', 'Image: Municipality Logo', 30),
('idc-v2-img-seal', 'variant2', 'img_seal', '/ph_logo.png', 'Image: PH Government Seal', 31);















-- RLS







ALTER TABLE id_card_config ENABLE ROW LEVEL SECURITY;







CREATE POLICY "Allow all access" ON id_card_config FOR ALL USING (true) WITH CHECK (true);















-- ====================================================







-- TABLE: system_settings







-- Stores global system settings (logo, brand, landing page)







-- ====================================================















DROP TABLE IF EXISTS system_settings;















CREATE TABLE system_settings (







  id TEXT PRIMARY KEY DEFAULT ('sys-' || extract(epoch from now())::bigint::text || '-' || floor(random() * 10000)::int::text),







  setting_key TEXT NOT NULL UNIQUE,







  setting_value TEXT NOT NULL DEFAULT '',







  setting_type TEXT DEFAULT 'text',   -- 'text', 'image', 'richtext', 'color'







  setting_label TEXT DEFAULT '',      -- Human-readable label







  setting_group TEXT DEFAULT 'general', -- 'logo', 'brand', 'landing'







  sort_order INT DEFAULT 0,







  created_at TIMESTAMPTZ DEFAULT now(),







  updated_at TIMESTAMPTZ DEFAULT now()







);















-- Trigger for updated_at







CREATE OR REPLACE FUNCTION update_system_settings_timestamp()







RETURNS TRIGGER AS $$







BEGIN







  NEW.updated_at = now();







  RETURN NEW;







END;







$$ language 'plpgsql';















CREATE TRIGGER update_system_settings_updated_at







  BEFORE UPDATE ON system_settings







  FOR EACH ROW EXECUTE FUNCTION update_system_settings_timestamp();















-- Seed default system settings







INSERT INTO system_settings (id, setting_key, setting_value, setting_type, setting_label, setting_group, sort_order) VALUES







-- Logo settings







('sys-logo-url', 'logo_url', '/ph_logo.png', 'image', 'System Logo', 'logo', 1),







('sys-logo-alt', 'logo_alt_text', 'OSCA Juban Logo', 'text', 'Logo Alt Text', 'logo', 2),







('sys-favicon', 'favicon_url', '/favicon.ico', 'image', 'Favicon', 'logo', 3),















-- Brand settings







('sys-brand-name', 'brand_name', 'OSCA Juban', 'text', 'System Name', 'brand', 1),







('sys-brand-tagline', 'brand_tagline', 'Senior Citizen Management System', 'text', 'Tagline', 'brand', 2),







('sys-brand-muni', 'brand_municipality', 'Municipality of Juban', 'text', 'Municipality Name', 'brand', 3),







('sys-brand-prov', 'brand_province', 'Sorsogon', 'text', 'Province', 'brand', 4),







('sys-brand-primary', 'brand_primary_color', '#02A952', 'color', 'Primary Brand Color', 'brand', 5),







('sys-brand-secondary', 'brand_secondary_color', '#0F766E', 'color', 'Secondary Brand Color', 'brand', 6),















-- Landing page settings







('sys-land-title', 'landing_title', 'Welcome to OSCA Juban', 'text', 'Landing Page Title', 'landing', 1),







('sys-land-subtitle', 'landing_subtitle', 'Senior Citizen Management System', 'text', 'Landing Subtitle', 'landing', 2),







('sys-land-desc', 'landing_description', 'A comprehensive digital platform for managing senior citizen records, ID generation, benefits tracking, and municipal coordination.', 'richtext', 'Landing Description', 'landing', 3),







('sys-land-hero', 'landing_hero_image', '', 'image', 'Hero Background Image', 'landing', 4),







('sys-land-footer', 'landing_footer_text', '© 2026 Office for Senior Citizens Affairs — Municipality of Juban, Sorsogon', 'text', 'Footer Text', 'landing', 5),







('sys-land-contact', 'landing_contact_info', 'Municipal Hall, Juban, Sorsogon', 'text', 'Contact Information', 'landing', 6),







('sys-land-announce', 'landing_show_announcements', 'true', 'text', 'Show Announcements Section', 'landing', 7),
('sys-land-logo1', 'landing_footer_logo1', '/Bagong_Pilipinas_Logo.svg.webp', 'image', 'Footer Logo 1 (Left)', 'landing', 8),
('sys-land-logo2', 'landing_footer_logo2', '/ph_logo.png', 'image', 'Footer Logo 2 (Right)', 'landing', 9),

-- Sidebar settings
('sys-sidebar-logo', 'sidebar_logo', '/juban-logo.png', 'image', 'Sidebar Logo', 'brand', 7),
('sys-sidebar-title', 'sidebar_title', 'JUBAN, SORSOGON', 'text', 'Sidebar Title', 'brand', 8),
('sys-sidebar-subtitle', 'sidebar_subtitle', 'OSCA LGU Portal', 'text', 'Sidebar Subtitle', 'brand', 9),
('sys-sidebar-version', 'sidebar_version', 'LGU-JUBAN v1.0.0', 'text', 'Sidebar Version Text', 'brand', 10);















-- RLS







ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;







CREATE POLICY "Allow all access" ON system_settings FOR ALL USING (true) WITH CHECK (true);







