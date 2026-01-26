-- ============================================================
-- PROJET CLOUD S5
-- BASE DE DONNEES COMPLETE
-- 3FN + HISTORISATION (INSERT ONLY)
-- PostgreSQL
-- ============================================================

-- ============================================================
-- 1. NETTOYAGE
-- ============================================================

DROP VIEW IF EXISTS v_utilisateur_actif CASCADE;
DROP VIEW IF EXISTS v_signalement_actuel CASCADE;

DROP TABLE IF EXISTS signalement_detail CASCADE;
DROP TABLE IF EXISTS signalement_statut CASCADE;
DROP TABLE IF EXISTS statut_signalement CASCADE;
DROP TABLE IF EXISTS signalement CASCADE;
DROP TABLE IF EXISTS entreprise CASCADE;

DROP TABLE IF EXISTS utilisateur_etat CASCADE;
DROP TABLE IF EXISTS etat_compte CASCADE;
DROP TABLE IF EXISTS tentative_connexion CASCADE;
DROP TABLE IF EXISTS utilisateur_role CASCADE;
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS utilisateur_password CASCADE;
DROP TABLE IF EXISTS utilisateur_info CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;

-- ============================================================
-- 2. AUTHENTIFICATION / UTILISATEURS
-- ============================================================

-- Identité utilisateur
CREATE TABLE utilisateur (
    id_utilisateur UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    source_auth VARCHAR(20) NOT NULL,
    date_creation TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Historique informations utilisateur
CREATE TABLE utilisateur_info (
    id_utilisateur_info BIGSERIAL PRIMARY KEY,
    id_utilisateur UUID NOT NULL REFERENCES utilisateur(id_utilisateur),
    nom VARCHAR(100),
    prenom VARCHAR(100),
    date_debut TIMESTAMP NOT NULL DEFAULT NOW(),
    date_fin TIMESTAMP
);

-- Historique mot de passe (auth locale)
CREATE TABLE utilisateur_password (
    id_password BIGSERIAL PRIMARY KEY,
    id_utilisateur UUID NOT NULL REFERENCES utilisateur(id_utilisateur),
    password_hash TEXT NOT NULL,
    date_debut TIMESTAMP NOT NULL DEFAULT NOW(),
    date_fin TIMESTAMP
);

-- Rôles
CREATE TABLE role (
    id_role BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO role (code) VALUES
('VISITEUR'),
('USER'),
('MANAGER');

-- Historique rôles utilisateur
CREATE TABLE utilisateur_role (
    id_utilisateur_role BIGSERIAL PRIMARY KEY,
    id_utilisateur UUID NOT NULL REFERENCES utilisateur(id_utilisateur),
    id_role BIGINT NOT NULL REFERENCES role(id_role),
    date_debut TIMESTAMP NOT NULL DEFAULT NOW(),
    date_fin TIMESTAMP
);

-- Tentatives de connexion
CREATE TABLE tentative_connexion (
    id_tentative BIGSERIAL PRIMARY KEY,
    id_utilisateur UUID REFERENCES utilisateur(id_utilisateur),
    date_tentative TIMESTAMP NOT NULL DEFAULT NOW(),
    succes BOOLEAN NOT NULL
);

-- ============================================================
-- 3. ETAT DU COMPTE (ACTIF / BLOQUE / INACTIF)
-- ============================================================

-- Types d’état
CREATE TABLE etat_compte (
    id_etat BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO etat_compte (code) VALUES
('ACTIF'),
('INACTIF'),
('BLOQUE');

-- Historique état utilisateur
CREATE TABLE utilisateur_etat (
    id_utilisateur_etat BIGSERIAL PRIMARY KEY,
    id_utilisateur UUID NOT NULL REFERENCES utilisateur(id_utilisateur),
    id_etat BIGINT NOT NULL REFERENCES etat_compte(id_etat),
    raison VARCHAR(255),
    date_debut TIMESTAMP NOT NULL DEFAULT NOW(),
    date_fin TIMESTAMP
);

-- ============================================================
-- 4. SIGNALEMENT ROUTIER
-- ============================================================

-- Signalement (identité)
CREATE TABLE signalement (
    id_signalement UUID PRIMARY KEY,
    id_utilisateur UUID REFERENCES utilisateur(id_utilisateur),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    source VARCHAR(20), -- WEB | MOBILE | FIREBASE
    date_creation TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Statuts signalement
CREATE TABLE statut_signalement (
    id_statut BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO statut_signalement (code) VALUES
('NOUVEAU'),
('EN_COURS'),
('TERMINE');

-- Historique statut signalement
CREATE TABLE signalement_statut (
    id_signalement_statut BIGSERIAL PRIMARY KEY,
    id_signalement UUID NOT NULL REFERENCES signalement(id_signalement),
    id_statut BIGINT NOT NULL REFERENCES statut_signalement(id_statut),
    date_debut TIMESTAMP NOT NULL DEFAULT NOW(),
    date_fin TIMESTAMP
);

-- Entreprise
CREATE TABLE entreprise (
    id_entreprise BIGSERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL UNIQUE
);

-- Historique détails signalement
CREATE TABLE signalement_detail (
    id_detail BIGSERIAL PRIMARY KEY,
    id_signalement UUID NOT NULL REFERENCES signalement(id_signalement),
    surface_m2 DECIMAL(10,2),
    budget DECIMAL(14,2),
    id_entreprise BIGINT REFERENCES entreprise(id_entreprise),
    date_debut TIMESTAMP NOT NULL DEFAULT NOW(),
    date_fin TIMESTAMP
);

-- ============================================================
-- 5. VUES (LECTURE SEULE)
-- ============================================================

-- Utilisateurs actifs
CREATE VIEW v_utilisateur_actif AS
SELECT
    u.id_utilisateur,
    u.email,
    ui.nom,
    ui.prenom
FROM utilisateur u
JOIN utilisateur_info ui
    ON ui.id_utilisateur = u.id_utilisateur
   AND ui.date_fin IS NULL
JOIN utilisateur_etat ue
    ON ue.id_utilisateur = u.id_utilisateur
   AND ue.date_fin IS NULL
JOIN etat_compte ec
    ON ec.id_etat = ue.id_etat
WHERE ec.code = 'ACTIF';

-- Signalements courants
CREATE VIEW v_signalement_actuel AS
SELECT
    s.id_signalement,
    s.latitude,
    s.longitude,
    st.code AS statut,
    d.surface_m2,
    d.budget,
    e.nom AS entreprise
FROM signalement s
JOIN signalement_statut ss
    ON ss.id_signalement = s.id_signalement
   AND ss.date_fin IS NULL
JOIN statut_signalement st
    ON st.id_statut = ss.id_statut
LEFT JOIN signalement_detail d
    ON d.id_signalement = s.id_signalement
   AND d.date_fin IS NULL
LEFT JOIN entreprise e
    ON e.id_entreprise = d.id_entreprise;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
