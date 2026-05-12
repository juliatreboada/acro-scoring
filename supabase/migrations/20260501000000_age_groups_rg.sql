-- ============================================
-- RG AGE GROUPS FOR RHYTHMIC GYMNASTICS
-- Sport type: 'rg'
-- Routine count: 0 (apparatus replaces routines)
-- ============================================

-- ============================================
-- ESCOLAR (Individual)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Iniciación Escolar', 'Individual', 0, 6, 7, 30, 'rg'),
  ('Prebenjamín Escolar', 'Individual', 0, 7, 8, 31, 'rg'),
  ('Benjamín Escolar', 'Individual', 0, 9, 9, 32, 'rg'),
  ('Alevín Escolar', 'Individual', 0, 10, 11, 33, 'rg'),
  ('Infantil Escolar', 'Individual', 0, 12, 13, 34, 'rg'),
  ('Cadete Escolar', 'Individual', 0, 14, 15, 35, 'rg'),
  ('Senior Escolar', 'Individual', 0, 16, NULL, 36, 'rg');

-- ============================================
-- ESCOLAR (Group)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Iniciación Escolar', 'Group', 0, 6, 7, 40, 'rg'),
  ('Prebenjamín Escolar', 'Group', 0, 7, 8, 41, 'rg'),
  ('Benjamín Escolar', 'Group', 0, 8, 9, 42, 'rg'),
  ('Alevín Escolar', 'Group', 0, 9, 11, 43, 'rg'),
  ('Infantil Escolar', 'Group', 0, 11, 13, 44, 'rg'),
  ('Cadete Escolar', 'Group', 0, 13, 15, 45, 'rg'),
  ('Senior Escolar', 'Group', 0, 15, NULL, 46, 'rg');

-- ============================================
-- PROMOCIÓN (Individual)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Prebenjamín Promoción', 'Individual', 0, 7, 8, 50, 'rg'),
  ('Benjamín Promoción', 'Individual', 0, 9, 9, 51, 'rg'),
  ('Alevín Promoción', 'Individual', 0, 10, 11, 52, 'rg'),
  ('Infantil Promoción', 'Individual', 0, 12, 13, 53, 'rg'),
  ('Cadete Promoción', 'Individual', 0, 14, 15, 54, 'rg'),
  ('Xuvenil Promoción', 'Individual', 0, 16, NULL, 55, 'rg'),
  ('Máster Promoción', 'Individual', 0, 19, NULL, 56, 'rg');

-- ============================================
-- PROMOCIÓN (Group)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Prebenjamín Promoción', 'Group', 0, 6, 8, 60, 'rg'),
  ('Benjamín Promoción', 'Group', 0, 8, 9, 61, 'rg'),
  ('Alevín Promoción', 'Group', 0, 9, 11, 62, 'rg'),
  ('Infantil Promoción', 'Group', 0, 11, 13, 63, 'rg'),
  ('Cadete Promoción', 'Group', 0, 13, 15, 64, 'rg'),
  ('Xuvenil Promoción', 'Group', 0, 15, NULL, 65, 'rg'),
  ('Máster Promoción', 'Group', 0, 19, NULL, 66, 'rg');

-- ============================================
-- PREBASE (Individual)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Prebenjamín Prebase', 'Individual', 0, 8, 8, 70, 'rg'),
  ('Benjamín Prebase', 'Individual', 0, 9, 9, 71, 'rg'),
  ('Alevín Prebase', 'Individual', 0, 10, 11, 72, 'rg'),
  ('Infantil Prebase', 'Individual', 0, 12, 13, 73, 'rg'),
  ('Cadete Prebase', 'Individual', 0, 14, 15, 74, 'rg'),
  ('Xuvenil Prebase', 'Individual', 0, 16, NULL, 75, 'rg');

-- ============================================
-- PREBASE (Group)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Prebenjamín Prebase', 'Group', 0, 7, 8, 80, 'rg'),
  ('Benjamín Prebase', 'Group', 0, 8, 9, 81, 'rg'),
  ('Alevín Prebase', 'Group', 0, 9, 11, 82, 'rg'),
  ('Infantil Prebase', 'Group', 0, 11, 13, 83, 'rg'),
  ('Cadete Prebase', 'Group', 0, 13, 15, 84, 'rg'),
  ('Xuvenil Prebase', 'Group', 0, 15, NULL, 85, 'rg');

-- ============================================
-- BASE (Individual)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Prebenjamín Base', 'Individual', 0, 8, 8, 90, 'rg'),
  ('Benjamín Base', 'Individual', 0, 9, 9, 91, 'rg'),
  ('Alevín 2016 Base', 'Individual', 0, 10, 10, 92, 'rg'),
  ('Alevín 2015 Base', 'Individual', 0, 11, 11, 93, 'rg'),
  ('Infantil 2014 Base', 'Individual', 0, 12, 12, 94, 'rg'),
  ('Infantil 2013 Base', 'Individual', 0, 13, 13, 95, 'rg'),
  ('Cadete 2012 Base', 'Individual', 0, 14, 14, 96, 'rg'),
  ('Cadete 2011 Base', 'Individual', 0, 15, 15, 97, 'rg'),
  ('Juvenil Base (2010-2009)', 'Individual', 0, 16, 17, 98, 'rg'),
  ('Juvenil Base (2008-2007)', 'Individual', 0, 18, 19, 99, 'rg'),
  ('Juvenil Base (2006+)', 'Individual', 0, 20, NULL, 100, 'rg');

-- ============================================
-- BASE (Group)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Prebenjamín Base', 'Group', 0, 7, 8, 110, 'rg'),
  ('Benjamín Base', 'Group', 0, 8, 9, 111, 'rg'),
  ('Alevín Base', 'Group', 0, 9, 11, 112, 'rg'),
  ('Infantil Base', 'Group', 0, 11, 13, 113, 'rg'),
  ('Cadete Base', 'Group', 0, 13, 15, 114, 'rg'),
  ('Juvenil Base', 'Group', 0, 15, NULL, 115, 'rg');

-- ============================================
-- COPA BASE (Individual)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Prebenjamín Copa Base', 'Individual', 0, 8, 8, 100, 'rg'),
  ('Benjamín Copa Base', 'Individual', 0, 9, 9, 101, 'rg'),
  ('Alevín Copa Base', 'Individual', 0, 10, 11, 102, 'rg'),
  ('Infantil Copa Base', 'Individual', 0, 12, 13, 103, 'rg'),
  ('Cadete Copa Base', 'Individual', 0, 14, 15, 104, 'rg'),
  ('Juvenil Copa Base', 'Individual', 0, 16, NULL, 105, 'rg');

-- ============================================
-- COPA BASE (Group)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Prebenjamín Copa Base', 'Group', 0, 7, 8, 120, 'rg'),
  ('Benjamín Copa Base', 'Group', 0, 8, 9, 121, 'rg'),
  ('Alevín Copa Base', 'Group', 0, 9, 11, 122, 'rg'),
  ('Infantil Copa Base', 'Group', 0, 11, 13, 123, 'rg'),
  ('Cadete Copa Base', 'Group', 0, 13, 15, 124, 'rg'),
  ('Juvenil Copa Base', 'Group', 0, 15, NULL, 125, 'rg');

-- ============================================
-- FEDERADO STYLE (Individual)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Benjamín', 'Individual', 0, 8, 9, 130, 'rg'),
  ('Alevín', 'Individual', 0, 10, 11, 131, 'rg'),
  ('Infantil', 'Individual', 0, 12, 13, 132, 'rg'),
  ('Júnior', 'Individual', 0, 14, 15, 133, 'rg'),
  ('Sénior', 'Individual', 0, 16, NULL, 134, 'rg'),
  ('1ª Categoría', 'Individual', 0, 15, NULL, 135, 'rg'),
  ('Júnior Honor', 'Individual', 0, 14, 15, 136, 'rg'),
  ('Sénior Honor', 'Individual', 0, 16, NULL, 137, 'rg'),
  ('Máster', 'Individual', 0, 24, NULL, 138, 'rg');

-- ============================================
-- EQUIPOS (Group)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Benjamín Equipos', 'Group', 0, 8, 9, 140, 'rg'),
  ('Alevín Equipos', 'Group', 0, 9, 11, 141, 'rg'),
  ('Infantil Equipos', 'Group', 0, 11, 13, 142, 'rg'),
  ('Júnior Equipos', 'Group', 0, 13, 15, 143, 'rg'),
  ('Sénior Equipos', 'Group', 0, 15, NULL, 144, 'rg'),
  ('1ª Categoría Equipos', 'Group', 0, 14, NULL, 145, 'rg');

-- ============================================
-- CONJUNTOS (Group)
-- ============================================
INSERT INTO "public"."age_group_rules" ("age_group", "ruleset", "routine_count", "min_age", "max_age", "sort_order", "sport_type") VALUES
  ('Benjamín Conjuntos', 'Group', 0, 8, 9, 150, 'rg'),
  ('Alevín Conjuntos', 'Group', 0, 9, 11, 151, 'rg'),
  ('Infantil Conjuntos', 'Group', 0, 11, 13, 152, 'rg'),
  ('Júnior Mixta Conjuntos', 'Group', 0, 13, 15, 153, 'rg'),
  ('Júnior Femenina Conjuntos', 'Group', 0, 13, 15, 154, 'rg'),
  ('Sénior Femenina Conjuntos', 'Group', 0, 15, NULL, 155, 'rg'),
  ('Sénior Mixta Conjuntos', 'Group', 0, 15, NULL, 156, 'rg'),
  ('1ª Categoría Femenina Conjuntos', 'Group', 0, 14, NULL, 157, 'rg'),
  ('1ª Categoría Mixta Conjuntos', 'Group', 0, 14, NULL, 158, 'rg');