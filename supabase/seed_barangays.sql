-- ============================================================
-- Seed Barangays for Municipality of Juban, Sorsogon
-- Run once to populate the barangays table with initial data.
-- Uses ON CONFLICT to be idempotent (safe to re-run).
-- ============================================================

INSERT INTO barangays (id, name, population, senior_count) VALUES
  ('brgy-anog',         'Añog',             0, 0),
  ('brgy-aroroy',       'Aroroy',           0, 0),
  ('brgy-bacolod',      'Bacolod',          0, 0),
  ('brgy-binanuahan',   'Binanuahan',       0, 0),
  ('brgy-biriran',      'Biriran',          0, 0),
  ('brgy-buraburan',    'Buraburan',        0, 0),
  ('brgy-calateo',      'Calateo',          0, 0),
  ('brgy-calmayon',     'Calmayon',         0, 0),
  ('brgy-caruhayon',    'Caruhayon',        0, 0),
  ('brgy-catanagan',    'Catanagan',        0, 0),
  ('brgy-catanusan',    'Catanusan',        0, 0),
  ('brgy-cogon',        'Cogon',            0, 0),
  ('brgy-embarcadero',  'Embarcadero',      0, 0),
  ('brgy-guruyan',      'Guruyan',          0, 0),
  ('brgy-lajong',       'Lajong',           0, 0),
  ('brgy-maalo',        'Maalo',            0, 0),
  ('brgy-north-pob',    'North Poblacion',  0, 0),
  ('brgy-puting-sapa',  'Puting Sapa',      0, 0),
  ('brgy-rangas',       'Rangas',           0, 0),
  ('brgy-sablayan',     'Sablayan',         0, 0),
  ('brgy-sipaya',       'Sipaya',           0, 0),
  ('brgy-south-pob',    'South Poblacion',  0, 0),
  ('brgy-taboc',        'Taboc',            0, 0),
  ('brgy-tinago',       'Tinago',           0, 0),
  ('brgy-tughan',       'Tughan',           0, 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
