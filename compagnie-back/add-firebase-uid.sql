-- ============================================================
-- Migration: Ajouter le support des UIDs Firebase
-- ============================================================
-- Ce script peut être exécuté sur une base existante
-- ============================================================

-- Ajouter la colonne firebase_uid pour stocker les UIDs Firebase
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128);

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_utilisateur_firebase_uid ON utilisateur(firebase_uid);

-- Vérifier le résultat
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'utilisateur' 
  AND column_name = 'firebase_uid';

-- Afficher le message de succès
SELECT 'Migration terminée avec succès - Colonne firebase_uid ajoutée' AS status;
