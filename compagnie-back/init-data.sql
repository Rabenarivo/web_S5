-- Script de vérification des données de référence
-- À exécuter si les rôles et états ne sont pas présents

-- Vérifier les rôles
SELECT * FROM role;

-- Vérifier les états
SELECT * FROM etat_compte;

-- Si vide, insérer les données de base:

-- Rôles (si non présents)
INSERT INTO role (code) VALUES ('VISITEUR') ON CONFLICT (code) DO NOTHING;
INSERT INTO role (code) VALUES ('USER') ON CONFLICT (code) DO NOTHING;
INSERT INTO role (code) VALUES ('MANAGER') ON CONFLICT (code) DO NOTHING;

-- États (si non présents)
INSERT INTO etat_compte (code) VALUES ('ACTIF') ON CONFLICT (code) DO NOTHING;
INSERT INTO etat_compte (code) VALUES ('INACTIF') ON CONFLICT (code) DO NOTHING;
INSERT INTO etat_compte (code) VALUES ('BLOQUE') ON CONFLICT (code) DO NOTHING;

-- Vérification finale
SELECT 'Roles:', COUNT(*) FROM role;
SELECT 'Etats:', COUNT(*) FROM etat_compte;
