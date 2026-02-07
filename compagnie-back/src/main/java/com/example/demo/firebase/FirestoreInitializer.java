package com.example.demo.firebase;

import com.example.demo.entite.*;
import com.example.demo.repository.*;
import com.google.cloud.firestore.Firestore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Initialise les collections Firestore au démarrage de l'application
 * Synchronise toutes les données existantes de PostgreSQL vers Firestore
 */
@Component
public class FirestoreInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(FirestoreInitializer.class);

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired(required = false)
    private FirestoreMapper firestoreMapper;

    @Autowired(required = false)
    private SignalementRepository signalementRepository;

    @Autowired(required = false)
    private UtilisateurRepository utilisateurRepository;

    @Autowired(required = false)
    private EntrepriseRepository entrepriseRepository;

    @Value("${firebase.sync.on.startup:true}")
    private boolean syncOnStartup;

    @Value("${firebase.enabled:true}")
    private boolean firebaseEnabled;

    @Override
    public void run(String... args) throws Exception {
        if (!firebaseEnabled || firestore == null) {
            logger.warn("Firebase désactivé - initialisation des collections ignorée");
            return;
        }

        logger.info("🔥 Début de l'initialisation des collections Firestore...");

        try {
            // Initialiser les collections (créer des documents vides si nécessaire)
            initializeCollections();

            // Synchroniser les données existantes si activé
            if (syncOnStartup) {
                syncExistingData();
            }

            logger.info("✅ Initialisation Firestore terminée avec succès");

        } catch (Exception e) {
            logger.error("❌ Erreur lors de l'initialisation Firestore: {}", e.getMessage(), e);
            // Ne pas bloquer le démarrage de l'application
        }
    }

    /**
     * Initialiser les collections Firestore
     * Crée les collections avec des métadonnées si elles n'existent pas
     */
    private void initializeCollections() {
        logger.info("📦 Initialisation des collections Firestore...");

        try {
            // Créer collection signalements avec document metadata
            createCollectionMetadata("signalements", "Collection des signalements de routes endommagées");
            
            // Créer collection utilisateurs avec document metadata
            createCollectionMetadata("utilisateurs", "Collection des utilisateurs de l'application");
            
            // Créer collection entreprises avec document metadata
            createCollectionMetadata("entreprises", "Collection des entreprises de réparation");

            logger.info("✅ Collections initialisées: signalements, utilisateurs, entreprises");

        } catch (Exception e) {
            logger.error("Erreur lors de la création des collections: {}", e.getMessage(), e);
        }
    }

    /**
     * Créer un document de metadata pour initialiser une collection
     */
    private void createCollectionMetadata(String collectionName, String description) {
        try {
            Map<String, Object> metadata = Map.of(
                "description", description,
                "created_at", new java.util.Date(),
                "initialized_by", "FirestoreInitializer",
                "version", "1.0"
            );

            firestore.collection(collectionName)
                    .document("_metadata")
                    .set(metadata)
                    .get();

            logger.info("  ✓ Collection '{}' initialisée", collectionName);

        } catch (Exception e) {
            logger.warn("  ⚠ Impossible de créer metadata pour '{}': {}", collectionName, e.getMessage());
        }
    }

    /**
     * Synchroniser toutes les données existantes de PostgreSQL vers Firestore
     */
    private void syncExistingData() {
        logger.info("🔄 Synchronisation des données existantes PostgreSQL → Firestore...");

        int totalSynced = 0;

        // Synchroniser les entreprises
        totalSynced += syncEntreprises();

        // Synchroniser les utilisateurs
        totalSynced += syncUtilisateurs();

        // Synchroniser les signalements
        totalSynced += syncSignalements();

        logger.info("✅ Synchronisation terminée: {} documents synchronisés", totalSynced);
    }

    /**
     * Synchroniser toutes les entreprises
     */
    private int syncEntreprises() {
        try {
            List<Entreprise> entreprises = entrepriseRepository.findAll();
            logger.info("  📊 Synchronisation de {} entreprises...", entreprises.size());

            int count = 0;
            for (Entreprise entreprise : entreprises) {
                try {
                    Map<String, Object> doc = firestoreMapper.entrepriseToFirestoreDocument(entreprise);
                    String docId = String.valueOf(entreprise.getIdEntreprise());
                    
                    firestore.collection("entreprises")
                            .document(docId)
                            .set(doc)
                            .get();
                    
                    count++;
                } catch (Exception e) {
                    logger.warn("    ⚠ Erreur sync entreprise {}: {}", entreprise.getIdEntreprise(), e.getMessage());
                }
            }

            logger.info("  ✓ {} entreprises synchronisées", count);
            return count;

        } catch (Exception e) {
            logger.error("  ✗ Erreur sync entreprises: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Synchroniser tous les utilisateurs
     */
    private int syncUtilisateurs() {
        try {
            List<Utilisateur> utilisateurs = utilisateurRepository.findAll();
            logger.info("  📊 Synchronisation de {} utilisateurs...", utilisateurs.size());

            int count = 0;
            for (Utilisateur utilisateur : utilisateurs) {
                try {
                    Map<String, Object> doc = firestoreMapper.utilisateurToFirestoreDocument(utilisateur);
                    String docId = utilisateur.getIdUtilisateur().toString();
                    
                    firestore.collection("utilisateurs")
                            .document(docId)
                            .set(doc)
                            .get();
                    
                    count++;
                } catch (Exception e) {
                    logger.warn("    ⚠ Erreur sync utilisateur {}: {}", utilisateur.getEmail(), e.getMessage());
                }
            }

            logger.info("  ✓ {} utilisateurs synchronisés", count);
            return count;

        } catch (Exception e) {
            logger.error("  ✗ Erreur sync utilisateurs: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Synchroniser tous les signalements
     */
    private int syncSignalements() {
        try {
            List<Signalement> signalements = signalementRepository.findAll();
            logger.info("  📊 Synchronisation de {} signalements...", signalements.size());

            int count = 0;
            for (Signalement signalement : signalements) {
                try {
                    Map<String, Object> doc = firestoreMapper.signalementToFirestoreDocument(signalement);
                    String docId = signalement.getIdSignalement().toString();
                    
                    firestore.collection("signalements")
                            .document(docId)
                            .set(doc)
                            .get();
                    
                    count++;
                } catch (Exception e) {
                    logger.warn("    ⚠ Erreur sync signalement {}: {}", signalement.getIdSignalement(), e.getMessage());
                }
            }

            logger.info("  ✓ {} signalements synchronisés", count);
            return count;

        } catch (Exception e) {
            logger.error("  ✗ Erreur sync signalements: {}", e.getMessage());
            return 0;
        }
    }
}
