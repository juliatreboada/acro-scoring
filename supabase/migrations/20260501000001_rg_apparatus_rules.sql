-- ============================================
-- APPARATUS RULES FOR RHYTHMIC GYMNASTICS
-- Years: 2026 and 2027
-- ============================================

-- ============================================
-- ESCOLAR INDIVIDUAL
-- ============================================

-- 2026
INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Iniciación Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Senior Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1

-- 2027
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Iniciación Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Senior Escolar' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1;

-- ============================================
-- ESCOLAR GROUP
-- ============================================

-- 2026
INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Iniciación Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Senior Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1

-- 2027
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Iniciación Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Senior Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Senior Escolar' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 2;

-- ============================================
-- PROMOCIÓN INDIVIDUAL
-- ============================================

-- 2026
INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1

-- 2027
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Promoción' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1;

-- ============================================
-- PROMOCIÓN GROUP
-- ============================================

-- 2026
INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 2

-- 2027
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Promoción' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1;

-- ============================================
-- PREBASE INDIVIDUAL
-- ============================================

INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1

-- 2027 (same as 2026 for Prebase — no changes provided)
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Prebase' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1;

-- ============================================
-- PREBASE GROUP
-- ============================================

INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 2

-- 2027 (same as 2026)
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Xuvenil Prebase' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 2;

-- ============================================
-- BASE INDIVIDUAL
-- ============================================

INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín 2016 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín 2015 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil 2014 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil 2013 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete 2012 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete 2011 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Base (2010-2009)' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Base (2008-2007)' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Base (2006+)' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1

-- 2027 (same as 2026)
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín 2016 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín 2015 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil 2014 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil 2013 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete 2012 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete 2011 Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Base (2010-2009)' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Base (2008-2007)' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Base (2006+)' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1;

-- ============================================
-- BASE GROUP
-- ============================================

INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 2

-- 2027 (same)
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 2;

-- ============================================
-- COPA BASE INDIVIDUAL
-- ============================================

INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1

-- 2027 (same)
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Copa Base' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1;

-- ============================================
-- COPA BASE GROUP
-- ============================================

INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 2

-- 2027 (same)
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Prebenjamín Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Cadete Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Juvenil Copa Base' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 2;

-- ============================================
-- FEDERADO STYLE INDIVIDUAL (Benjamín, Alevín, Infantil, Júnior, Sénior, 1ª Categoría, Júnior Honor, Sénior Honor)
-- ============================================

-- 2026
INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
-- Benjamín
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 2
UNION ALL
-- Alevín
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 3
UNION ALL
-- Infantil
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 3
UNION ALL
-- Júnior
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
-- Sénior
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 3
UNION ALL
-- 1ª Categoría
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 4
UNION ALL
-- Júnior Honor
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 4
UNION ALL
-- Sénior Honor
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 4

-- 2027 (same as 2026 for Federado style)
UNION ALL
-- Benjamín
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 2
UNION ALL
-- Alevín
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 3
UNION ALL
-- Infantil
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 3
UNION ALL
-- Júnior
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
-- Sénior
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 3
UNION ALL
-- 1ª Categoría
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 4
UNION ALL
-- Júnior Honor
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 4
UNION ALL
-- Sénior Honor
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Honor' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 4;

-- ============================================
-- MÁSTER (Choice — all apparatus optional, club chooses 1)
-- ============================================

INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), false, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), false, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), false, 3
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), false, 4
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), false, 5
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Rope'), false, 6

-- 2027 (same)
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), false, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), false, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), false, 3
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), false, 4
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), false, 5
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Máster' AND ruleset = 'Individual' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), false, 6;

-- ============================================
-- EQUIPOS (Group)
-- ============================================

-- 2026
INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
-- Benjamín Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 2
UNION ALL
-- Alevín Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 3
UNION ALL
-- Infantil Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 3
UNION ALL
-- Júnior Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
-- Sénior Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 3
UNION ALL
-- 1ª Categoría Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 4

-- 2027 (same)
UNION ALL
-- Benjamín Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 2
UNION ALL
-- Alevín Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 3
UNION ALL
-- Infantil Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Rope'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 3
UNION ALL
-- Júnior Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
-- Sénior Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 3
UNION ALL
-- 1ª Categoría Equipos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 2
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 3
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Equipos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ribbon'), true, 4;

-- ============================================
-- CONJUNTOS (Group)
-- ============================================

-- 2026
INSERT INTO "public"."apparatus_rules" ("age_group_rule_id", "year", "apparatus_id", "is_mandatory", "sort_order")
-- Benjamín Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
-- Alevín Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
-- Infantil Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
-- Júnior Mixta Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Mixta Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
-- Júnior Femenina Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Femenina Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
-- Sénior Femenina Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Femenina Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Femenina Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
-- Sénior Mixta Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Mixta Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Mixta Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
-- 1ª Categoría Femenina Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Femenina Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Femenina Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 2
UNION ALL
-- 1ª Categoría Mixta Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Mixta Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Mixta Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2026, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 2

-- 2027 (same)
UNION ALL
-- Benjamín Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Benjamín Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
-- Alevín Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Free'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Alevín Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
-- Infantil Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Infantil Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
-- Júnior Mixta Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Mixta Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
-- Júnior Femenina Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Júnior Femenina Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 1
UNION ALL
-- Sénior Femenina Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Femenina Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Femenina Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
-- Sénior Mixta Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Mixta Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Ball'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = 'Sénior Mixta Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 2
UNION ALL
-- 1ª Categoría Femenina Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Femenina Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Femenina Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 2
UNION ALL
-- 1ª Categoría Mixta Conjuntos
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Mixta Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Hoop'), true, 1
UNION ALL
SELECT 
  (SELECT id FROM age_group_rules WHERE age_group = '1ª Categoría Mixta Conjuntos' AND ruleset = 'Group' AND sport_type = 'rg'),
  2027, (SELECT id FROM apparatus WHERE name = 'Clubs'), true, 2;