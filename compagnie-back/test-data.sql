-- ============================================================
-- DONNEES DE TEST - SIGNALEMENTS ROUTIERS ANTANANARIVO
-- ============================================================

-- Insérer des entreprises
INSERT INTO entreprise (nom) VALUES
('BTP Madagascar'),
('Routes Modernes SARL'),
('Travaux Publics Tananarive'),
('Construction Express');

-- Insérer des signalements de test dans différents quartiers d'Antananarivo
-- Format: (id, id_utilisateur, latitude, longitude, source, date_creation)

-- Signalement 1: Analakely (centre-ville)
INSERT INTO signalement (id_signalement, id_utilisateur, latitude, longitude, source, date_creation) 
VALUES ('550e8400-e29b-41d4-a716-446655440001'::uuid, NULL, -18.9139, 47.5230, 'WEB', NOW() - INTERVAL '5 days');

INSERT INTO signalement_statut (id_signalement, id_statut, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440001'::uuid, 
        (SELECT id_statut FROM statut_signalement WHERE code = 'EN_COURS'), 
        NOW() - INTERVAL '3 days');

INSERT INTO signalement_detail (id_signalement, surface_m2, budget, id_entreprise, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440001'::uuid, 
        25.50, 
        5000000.00, 
        (SELECT id_entreprise FROM entreprise WHERE nom = 'BTP Madagascar'), 
        NOW() - INTERVAL '3 days');

-- Signalement 2: Ankorondrano
INSERT INTO signalement (id_signalement, id_utilisateur, latitude, longitude, source, date_creation) 
VALUES ('550e8400-e29b-41d4-a716-446655440002'::uuid, NULL, -18.9088, 47.5324, 'MOBILE', NOW() - INTERVAL '3 days');

INSERT INTO signalement_statut (id_signalement, id_statut, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440002'::uuid, 
        (SELECT id_statut FROM statut_signalement WHERE code = 'NOUVEAU'), 
        NOW() - INTERVAL '3 days');

-- Signalement 3: Behoririka
INSERT INTO signalement (id_signalement, id_utilisateur, latitude, longitude, source, date_creation) 
VALUES ('550e8400-e29b-41d4-a716-446655440003'::uuid, NULL, -18.9180, 47.5250, 'WEB', NOW() - INTERVAL '2 days');

INSERT INTO signalement_statut (id_signalement, id_statut, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440003'::uuid, 
        (SELECT id_statut FROM statut_signalement WHERE code = 'NOUVEAU'), 
        NOW() - INTERVAL '2 days');

-- Signalement 4: Tsimbazaza
INSERT INTO signalement (id_signalement, id_utilisateur, latitude, longitude, source, date_creation) 
VALUES ('550e8400-e29b-41d4-a716-446655440004'::uuid, NULL, -18.9274, 47.5289, 'WEB', NOW() - INTERVAL '1 day');

INSERT INTO signalement_statut (id_signalement, id_statut, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440004'::uuid, 
        (SELECT id_statut FROM statut_signalement WHERE code = 'EN_COURS'), 
        NOW() - INTERVAL '1 day');

INSERT INTO signalement_detail (id_signalement, surface_m2, budget, id_entreprise, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440004'::uuid, 
        18.75, 
        3500000.00, 
        (SELECT id_entreprise FROM entreprise WHERE nom = 'Routes Modernes SARL'), 
        NOW() - INTERVAL '1 day');

-- Signalement 5: Ambohijatovo
INSERT INTO signalement (id_signalement, id_utilisateur, latitude, longitude, source, date_creation) 
VALUES ('550e8400-e29b-41d4-a716-446655440005'::uuid, NULL, -18.9106, 47.5361, 'MOBILE', NOW() - INTERVAL '12 hours');

INSERT INTO signalement_statut (id_signalement, id_statut, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440005'::uuid, 
        (SELECT id_statut FROM statut_signalement WHERE code = 'NOUVEAU'), 
        NOW() - INTERVAL '12 hours');

-- Signalement 6: Ankadifotsy
INSERT INTO signalement (id_signalement, id_utilisateur, latitude, longitude, source, date_creation) 
VALUES ('550e8400-e29b-41d4-a716-446655440006'::uuid, NULL, -18.8952, 47.5343, 'WEB', NOW() - INTERVAL '7 days');

INSERT INTO signalement_statut (id_signalement, id_statut, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440006'::uuid, 
        (SELECT id_statut FROM statut_signalement WHERE code = 'TERMINE'), 
        NOW() - INTERVAL '7 days');

INSERT INTO signalement_detail (id_signalement, surface_m2, budget, id_entreprise, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440006'::uuid, 
        42.00, 
        8500000.00, 
        (SELECT id_entreprise FROM entreprise WHERE nom = 'Travaux Publics Tananarive'), 
        NOW() - INTERVAL '6 days');

-- Signalement 7: Isotry
INSERT INTO signalement (id_signalement, id_utilisateur, latitude, longitude, source, date_creation) 
VALUES ('550e8400-e29b-41d4-a716-446655440007'::uuid, NULL, -18.9245, 47.5314, 'WEB', NOW() - INTERVAL '4 hours');

INSERT INTO signalement_statut (id_signalement, id_statut, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440007'::uuid, 
        (SELECT id_statut FROM statut_signalement WHERE code = 'NOUVEAU'), 
        NOW() - INTERVAL '4 hours');

-- Signalement 8: Isoraka
INSERT INTO signalement (id_signalement, id_utilisateur, latitude, longitude, source, date_creation) 
VALUES ('550e8400-e29b-41d4-a716-446655440008'::uuid, NULL, -18.9045, 47.5274, 'MOBILE', NOW() - INTERVAL '6 days');

INSERT INTO signalement_statut (id_signalement, id_statut, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440008'::uuid, 
        (SELECT id_statut FROM statut_signalement WHERE code = 'EN_COURS'), 
        NOW() - INTERVAL '5 days');

INSERT INTO signalement_detail (id_signalement, surface_m2, budget, id_entreprise, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440008'::uuid, 
        31.20, 
        6200000.00, 
        (SELECT id_entreprise FROM entreprise WHERE nom = 'Construction Express'), 
        NOW() - INTERVAL '5 days');

-- Signalement 9: Mahamasina
INSERT INTO signalement (id_signalement, id_utilisateur, latitude, longitude, source, date_creation) 
VALUES ('550e8400-e29b-41d4-a716-446655440009'::uuid, NULL, -18.9172, 47.5302, 'WEB', NOW() - INTERVAL '2 hours');

INSERT INTO signalement_statut (id_signalement, id_statut, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440009'::uuid, 
        (SELECT id_statut FROM statut_signalement WHERE code = 'NOUVEAU'), 
        NOW() - INTERVAL '2 hours');

-- Signalement 10: Ambohitsorohitra (Palais présidentiel)
INSERT INTO signalement (id_signalement, id_utilisateur, latitude, longitude, source, date_creation) 
VALUES ('550e8400-e29b-41d4-a716-446655440010'::uuid, NULL, -18.9068, 47.5240, 'WEB', NOW() - INTERVAL '8 days');

INSERT INTO signalement_statut (id_signalement, id_statut, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440010'::uuid, 
        (SELECT id_statut FROM statut_signalement WHERE code = 'TERMINE'), 
        NOW() - INTERVAL '8 days');

INSERT INTO signalement_detail (id_signalement, surface_m2, budget, id_entreprise, date_debut) 
VALUES ('550e8400-e29b-41d4-a716-446655440010'::uuid, 
        55.00, 
        12000000.00, 
        (SELECT id_entreprise FROM entreprise WHERE nom = 'BTP Madagascar'), 
        NOW() - INTERVAL '7 days');

-- ============================================================
-- STATISTIQUES
-- ============================================================
-- Total signalements: 10
-- - NOUVEAU: 5
-- - EN_COURS: 3
-- - TERMINE: 2
-- Entreprises: 4
-- Répartition géographique: Centre-ville d'Antananarivo
-- ============================================================
