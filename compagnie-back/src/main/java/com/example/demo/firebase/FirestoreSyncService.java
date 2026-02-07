package com.example.demo.firebase;

import com.example.demo.entite.Entreprise;
import com.example.demo.entite.Signalement;
import com.example.demo.entite.TentativeConnexion;
import com.example.demo.entite.Utilisateur;
import com.example.demo.event.EntrepriseEvent;
import com.example.demo.event.SignalementEvent;
import com.example.demo.event.UtilisateurEvent;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * Service de synchronisation avec Firestore
 * Écoute les événements de changement d'entités et synchronise avec Firebase
 */
@Service
public class FirestoreSyncService {

    private static final Logger logger = LoggerFactory.getLogger(FirestoreSyncService.class);

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired
    private FirestoreMapper firestoreMapper;

    // Noms des collections Firestore
    private static final String COLLECTION_SIGNALEMENTS = "signalements";
    private static final String COLLECTION_UTILISATEURS = "utilisateurs";
    private static final String COLLECTION_ENTREPRISES = "entreprises";
    private static final String COLLECTION_TENTATIVES_CONNEXION = "tentatives_connexion";

    /**
     * Synchroniser un signalement vers Firestore après commit de transaction
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSignalementEvent(SignalementEvent event) {
        if (firestore == null) {
            logger.debug("Firestore désactivé - événement ignoré: {}", event.getEventType());
            return;
        }

        try {
            Signalement signalement = event.getSignalement();
            String documentId = firestoreMapper.getFirestoreDocumentId(signalement.getIdSignalement());

            switch (event.getEventType()) {
                case CREATED, UPDATED -> syncSignalement(signalement, documentId);
                case DELETED -> deleteSignalement(documentId);
            }
        } catch (Exception e) {
            logger.error("Erreur lors de la synchronisation Firestore du signalement: {}", e.getMessage(), e);
            // Ne pas propager l'erreur - la transaction PostgreSQL est déjà commitée
        }
    }

    /**
     * Synchroniser un utilisateur vers Firestore après commit de transaction
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUtilisateurEvent(UtilisateurEvent event) {
        if (firestore == null) {
            logger.debug("Firestore désactivé - événement ignoré: {}", event.getEventType());
            return;
        }

        try {
            Utilisateur utilisateur = event.getUtilisateur();
            String documentId = firestoreMapper.getFirestoreDocumentId(utilisateur.getIdUtilisateur());

            switch (event.getEventType()) {
                case CREATED, UPDATED -> syncUtilisateur(utilisateur, documentId);
            }
        } catch (Exception e) {
            logger.error("Erreur lors de la synchronisation Firestore de l'utilisateur: {}", e.getMessage(), e);
        }
    }

    /**
     * Synchroniser une entreprise vers Firestore après commit de transaction
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEntrepriseEvent(EntrepriseEvent event) {
        if (firestore == null) {
            logger.debug("Firestore désactivé - événement ignoré: {}", event.getEventType());
            return;
        }

        try {
            Entreprise entreprise = event.getEntreprise();
            String documentId = String.valueOf(entreprise.getIdEntreprise());

            switch (event.getEventType()) {
                case CREATED, UPDATED -> syncEntreprise(entreprise, documentId);
            }
        } catch (Exception e) {
            logger.error("Erreur lors de la synchronisation Firestore de l'entreprise: {}", e.getMessage(), e);
        }
    }

    /**
     * Synchroniser un signalement vers Firestore
     */
    private void syncSignalement(Signalement signalement, String documentId) throws ExecutionException, InterruptedException {
        Map<String, Object> document = firestoreMapper.signalementToFirestoreDocument(signalement);
        
        DocumentReference docRef = firestore.collection(COLLECTION_SIGNALEMENTS).document(documentId);
        ApiFuture<WriteResult> result = docRef.set(document);
        
        WriteResult writeResult = result.get();
        logger.info("Signalement synchronisé vers Firestore: {} à {}", documentId, writeResult.getUpdateTime());
    }

    /**
     * Supprimer un signalement de Firestore
     */
    private void deleteSignalement(String documentId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_SIGNALEMENTS).document(documentId);
        ApiFuture<WriteResult> result = docRef.delete();
        
        WriteResult writeResult = result.get();
        logger.info("Signalement supprimé de Firestore: {} à {}", documentId, writeResult.getUpdateTime());
    }

    /**
     * Synchroniser un utilisateur vers Firestore
     */
    private void syncUtilisateur(Utilisateur utilisateur, String documentId) throws ExecutionException, InterruptedException {
        Map<String, Object> document = firestoreMapper.utilisateurToFirestoreDocument(utilisateur);
        
        DocumentReference docRef = firestore.collection(COLLECTION_UTILISATEURS).document(documentId);
        ApiFuture<WriteResult> result = docRef.set(document);
        
        WriteResult writeResult = result.get();
        logger.info("Utilisateur synchronisé vers Firestore: {} à {}", documentId, writeResult.getUpdateTime());
    }

    /**
     * Synchroniser une entreprise vers Firestore
     */
    private void syncEntreprise(Entreprise entreprise, String documentId) throws ExecutionException, InterruptedException {
        Map<String, Object> document = firestoreMapper.entrepriseToFirestoreDocument(entreprise);
        
        DocumentReference docRef = firestore.collection(COLLECTION_ENTREPRISES).document(documentId);
        ApiFuture<WriteResult> result = docRef.set(document);
        
        WriteResult writeResult = result.get();
        logger.info("Entreprise synchronisée vers Firestore: {} à {}", documentId, writeResult.getUpdateTime());
    }

    /**
     * Méthode publique pour synchronisation manuelle (optionnelle)
     */
    public void forceSyncSignalement(Signalement signalement) {
        if (firestore == null) {
            logger.warn("Firestore désactivé - synchronisation manuelle impossible");
            return;
        }

        try {
            String documentId = firestoreMapper.getFirestoreDocumentId(signalement.getIdSignalement());
            syncSignalement(signalement, documentId);
        } catch (Exception e) {
            logger.error("Erreur lors de la synchronisation manuelle du signalement: {}", e.getMessage(), e);
            throw new RuntimeException("Échec de la synchronisation Firestore", e);
        }
    }

    /**
     * Synchroniser une tentative de connexion vers Firestore
     */
    @Async
    public void syncTentativeConnexion(TentativeConnexion tentative) {
        if (firestore == null) {
            logger.warn("Firestore non configuré, synchronisation des tentatives impossible");
            return;
        }

        try {
            Map<String, Object> data = new HashMap<>();
            
            // Ajouter l'ID utilisateur seulement s'il existe
            if (tentative.getIdUtilisateur() != null) {
                data.put("id_utilisateur", tentative.getIdUtilisateur().toString());
            }
            
            data.put("date_tentative", tentative.getDateTentative());
            data.put("succes", tentative.getSucces());
            
            // Enregistrer dans Firestore
            ApiFuture<DocumentReference> result = firestore.collection(COLLECTION_TENTATIVES_CONNEXION).add(data);
            DocumentReference docRef = result.get();

            logger.info("Tentative de connexion synchronisée vers Firestore: {} - Succès: {}", 
                    docRef.getId(), tentative.getSucces());
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Erreur lors de la synchronisation Firestore de la tentative: ", e);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            logger.error("Erreur inattendue lors de la synchronisation Firestore: ", e);
        }
    }

    /**
     * Synchroniser un blocage de compte vers Firestore
     */
    @Async
    public void syncBlockageCompte(String email) {
        if (firestore == null) {
            logger.warn("Firestore non configuré, synchronisation du blocage impossible");
            return;
        }

        try {
            Map<String, Object> updateData = new HashMap<>();
            updateData.put("etat", "BLOQUE");
            updateData.put("raison_blocage", "Bloqué après 3 tentatives de connexion échouées");
            updateData.put("date_modification", java.time.LocalDateTime.now());

            // Trouver et mettre à jour le document par email
            firestore.collection(COLLECTION_UTILISATEURS)
                    .whereEqualTo("email", email)
                    .get()
                    .get()
                    .getDocuments()
                    .forEach(document -> {
                        try {
                            document.getReference().update(updateData).get();
                            logger.info("Compte bloqué synchronisé vers Firestore: {}", email);
                        } catch (InterruptedException | ExecutionException e) {
                            logger.error("Erreur lors de la synchronisation du blocage: ", e);
                            Thread.currentThread().interrupt();
                        }
                    });
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Erreur lors de la recherche du compte: ", e);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            logger.error("Erreur inattendue lors de la synchronisation du blocage: ", e);
        }
    }
}
