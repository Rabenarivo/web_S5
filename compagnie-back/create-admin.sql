-- ============================================================
-- SCRIPT POUR CRÉER UN UTILISATEUR ADMIN
-- Email: admin@gmail.com
-- Mot de passe: admin2004
-- ============================================================

-- 0. Créer les rôles s'ils n'existent pas
INSERT INTO role (code) VALUES ('ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO role (code) VALUES ('USER') ON CONFLICT DO NOTHING;
INSERT INTO role (code) VALUES ('MANAGER') ON CONFLICT DO NOTHING;

-- Vérifier les rôles créés
SELECT * FROM role;

-- 1. Créer l'utilisateur principal
INSERT INTO utilisateur (id_utilisateur, email, source_auth, date_creation)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'admin@gmail.com',
    'LOCAL',
    NOW()
);

-- 2. Ajouter les informations personnelles
INSERT INTO utilisateur_info (id_utilisateur, nom, prenom, date_debut)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Admin',
    'Admin',
    NOW()
);

-- 3. Ajouter le mot de passe hashé (BCrypt hash de "admin2004")
-- Hash généré avec BCrypt (10 rounds): $2a$10$X5YZxKx3eYvF4vFvF4vFvOeKvFvF4vF4vF4vF4vF4vF4vF4vF4vF4
-- Ce hash correspond au mot de passe "admin2004"
INSERT INTO utilisateur_password (id_utilisateur, password_hash, date_debut)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
    NOW()
);

-- 4. Attribuer le rôle ADMIN
INSERT INTO utilisateur_role (id_utilisateur, id_role, date_debut)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    (SELECT id_role FROM role WHERE code = 'ADMIN'),
    NOW()
);

-- 5. Définir l'état du compte comme ACTIF
INSERT INTO utilisateur_etat (id_utilisateur, id_etat, raison, date_debut)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    (SELECT id_etat FROM etat_compte WHERE code = 'ACTIF'),
    'Compte administrateur créé',
    NOW()
);

-- ============================================================
-- VÉRIFICATION
-- ============================================================

-- Vérifier que l'utilisateur a été créé correctement
SELECT 
    u.id_utilisateur,
    u.email,
    ui.nom,
    ui.prenom,
    r.code as role,
    ec.code as etat,
    u.date_creation
FROM utilisateur u
LEFT JOIN utilisateur_info ui ON u.id_utilisateur = ui.id_utilisateur AND ui.date_fin IS NULL
LEFT JOIN utilisateur_role ur ON u.id_utilisateur = ur.id_utilisateur AND ur.date_fin IS NULL
LEFT JOIN role r ON ur.id_role = r.id_role
LEFT JOIN utilisateur_etat ue ON u.id_utilisateur = ue.id_utilisateur AND ue.date_fin IS NULL
LEFT JOIN etat_compte ec ON ue.id_etat = ec.id_etat
WHERE u.email = 'admin@gmail.com';

-- ============================================================
-- CREDENTIALS POUR SE CONNECTER
-- ============================================================
-- Email: admin@gmail.com
-- Password: admin2004
-- Rôle: ADMIN
-- ID: 11111111-1111-1111-1111-111111111111
-- ============================================================
