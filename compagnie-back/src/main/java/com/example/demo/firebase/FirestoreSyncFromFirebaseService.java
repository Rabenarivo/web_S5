package com.example.demo.firebase;

import com.example.demo.entite.*;
import com.example.demo.repository.*;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ExecutionException;

/**
 * Service de synchronisation Firestore → PostgreSQL
 * Importe les données créées dans Firestore (mobile) vers PostgreSQL
 */
@Service
public class FirestoreSyncFromFirebaseService {

    private static final Logger logger = LoggerFactory.getLogger(FirestoreSyncFromFirebaseService.class);

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private SignalementStatutRepository signalementStatutRepository;

    @Autowired
    private StatutSignalementRepository statutSignalementRepository;

    @Autowired
    private SignalementDetailRepository signalementDetailRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private UtilisateurInfoRepository utilisateurInfoRepository;

    @Autowired
    private UtilisateurRoleRepository utilisateurRoleRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UtilisateurEtatRepository utilisateurEtatRepository;

    @Autowired
    private EtatCompteRepository etatCompteRepository;

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    /**
     * Synchroniser tous les signalements depuis Firestore
     */
    @Transactional
    public Map<String, Object> syncSignalementsFromFirestore() {
        Map<String, Object> result = new HashMap<>();
        int created = 0;
        int updated = 0;
        int errors = 0;
        List<String> errorDetails = new ArrayList<>();

        if (firestore == null) {
            result.put("status", "error");
            result.put("message", "Firestore n'est pas configuré");
            return result;
        }

        try {
            List<QueryDocumentSnapshot> documents = firestore.collection("signalements")
                    .get()
                    .get()
                    .getDocuments();

            logger.info("Trouvé {} signalements dans Firestore", documents.size());

            for (QueryDocumentSnapshot doc : documents) {
                // Ignorer le document metadata
                if (doc.getId().equals("_metadata")) {
                    continue;
                }

                try {
                    Map<String, Object> data = doc.getData();
                    logger.info("Document ID: {}, données: {}", doc.getId(), data);
                    
                    // Vérifier les champs obligatoires
                    if (!data.containsKey("id_utilisateur") || 
                        !data.containsKey("latitude") || 
                        !data.containsKey("longitude")) {
                        String errorMsg = String.format("Document %s manque de champs obligatoires. Champs: %s", 
                            doc.getId(), data.keySet());
                        logger.warn(errorMsg);
                        errorDetails.add(errorMsg);
                        errors++;
                        continue;
                    }

                    // Gérer l'identifiant utilisateur (UUID PostgreSQL ou UID Firebase)
                    UUID idUtilisateur;
                    String userIdStr = data.get("id_utilisateur").toString();
                    
                    try {
                        // Essayer de convertir en UUID
                        idUtilisateur = UUID.fromString(userIdStr);
                    } catch (IllegalArgumentException e) {
                        // C'est un UID Firebase, chercher ou créer l'utilisateur
                        logger.info("UID Firebase détecté: {}", userIdStr);
                        Optional<Utilisateur> firebaseUser = utilisateurRepository.findByFirebaseUid(userIdStr);
                        
                        if (firebaseUser.isPresent()) {
                            idUtilisateur = firebaseUser.get().getIdUtilisateur();
                            logger.info("Utilisateur Firebase trouvé: {} -> {}", userIdStr, idUtilisateur);
                        } else {
                            // Créer un nouvel utilisateur pour cet UID Firebase
                            Utilisateur newUser = new Utilisateur();
                            newUser.setEmail("firebase_" + userIdStr + "@mobile.app");
                            newUser.setSourceAuth("FIREBASE");
                            newUser.setFirebaseUid(userIdStr);
                            newUser.setDateCreation(LocalDateTime.now());
                            utilisateurRepository.save(newUser);
                            
                            idUtilisateur = newUser.getIdUtilisateur();
                            logger.info("Nouvel utilisateur Firebase créé: {} -> {}", userIdStr, idUtilisateur);
                        }
                    }

                    Double latitude = Double.parseDouble(data.get("latitude").toString());
                    Double longitude = Double.parseDouble(data.get("longitude").toString());
                    String source = data.getOrDefault("source", "FIREBASE").toString();
                    String description = data.getOrDefault("description", "").toString();

                    logger.info("Traitement signalement - User: {}, Lat: {}, Lng: {}, Source: {}", 
                        idUtilisateur, latitude, longitude, source);

                    // Vérifier si le signalement existe déjà (par coordonnées et utilisateur)
                    List<Signalement> existingSignalements = signalementRepository
                            .findByIdUtilisateurAndLatitudeAndLongitude(idUtilisateur, latitude, longitude);

                    Signalement signalement;
                    boolean isNew = existingSignalements.isEmpty();

                    if (isNew) {
                        // Créer un nouveau signalement
                        signalement = new Signalement();
                        signalement.setIdUtilisateur(idUtilisateur);
                        signalement.setLatitude(latitude);
                        signalement.setLongitude(longitude);
                        signalement.setSource(source);
                        signalement.setDateCreation(extractDate(data.get("date_creation")));
                        signalementRepository.save(signalement);

                        // Créer le statut initial
                        String statutCode = data.getOrDefault("statut", "NOUVEAU").toString();
                        StatutSignalement statut = statutSignalementRepository.findByCode(statutCode)
                                .orElse(statutSignalementRepository.findByCode("NOUVEAU")
                                        .orElseThrow(() -> new RuntimeException("Statut NOUVEAU non trouvé")));

                        SignalementStatut signalementStatut = new SignalementStatut();
                        signalementStatut.setIdSignalement(signalement.getIdSignalement());
                        signalementStatut.setIdStatut(statut.getIdStatut());
                        signalementStatut.setDateDebut(signalement.getDateCreation());
                        signalementStatutRepository.save(signalementStatut);

                        created++;
                        logger.info("Signalement créé: {}", signalement.getIdSignalement());
                    } else {
                        // Mettre à jour si nécessaire
                        signalement = existingSignalements.get(0);
                        updated++;
                        logger.info("Signalement existant: {}", signalement.getIdSignalement());
                    }

                } catch (IllegalArgumentException e) {
                    String errorMsg = String.format("Document %s - Erreur de format: %s", doc.getId(), e.getMessage());
                    logger.error(errorMsg);
                    errorDetails.add(errorMsg);
                    errors++;
                } catch (Exception e) {
                    String errorMsg = String.format("Document %s - Erreur: %s", doc.getId(), e.getMessage());
                    logger.error("Document {} - Erreur inattendue [{}]: {}", 
                        doc.getId(), e.getClass().getSimpleName(), e.getMessage());
                    errorDetails.add(errorMsg);
                    if (logger.isDebugEnabled()) {
                        logger.debug("Stack trace complet:", e);
                    }
                    errors++;
                }
            }

            result.put("status", "success");
            result.put("created", created);
            result.put("updated", updated);
            result.put("errors", errors);
            result.put("total", documents.size() - 1); // -1 pour exclure _metadata
            if (!errorDetails.isEmpty()) {
                result.put("errorDetails", errorDetails);
            }

            logger.info("Synchronisation terminée - Créés: {}, Mis à jour: {}, Erreurs: {}, Total: {}", 
                created, updated, errors, documents.size() - 1);
            if (!errorDetails.isEmpty()) {
                logger.warn("Détails des erreurs: {}", errorDetails);
            }

        } catch (InterruptedException | ExecutionException e) {
            logger.error("Erreur lors de la synchronisation des signalements", e);
            result.put("status", "error");
            result.put("message", e.getMessage());
        }

        return result;
    }

    /**
     * Synchroniser tous les utilisateurs depuis Firestore
     */
    @Transactional
    public Map<String, Object> syncUtilisateursFromFirestore() {
        Map<String, Object> result = new HashMap<>();
        int created = 0;
        int updated = 0;
        int errors = 0;

        if (firestore == null) {
            result.put("status", "error");
            result.put("message", "Firestore n'est pas configuré");
            return result;
        }

        try {
            List<QueryDocumentSnapshot> documents = firestore.collection("utilisateurs")
                    .get()
                    .get()
                    .getDocuments();

            logger.info("Trouvé {} utilisateurs dans Firestore", documents.size());

            for (QueryDocumentSnapshot doc : documents) {
                // Ignorer le document metadata
                if (doc.getId().equals("_metadata")) {
                    continue;
                }

                try {
                    Map<String, Object> data = doc.getData();
                    
                    // Vérifier les champs obligatoires
                    if (!data.containsKey("email")) {
                        logger.warn("Document {} manque de champ email", doc.getId());
                        errors++;
                        continue;
                    }

                    String email = data.get("email").toString();
                    String sourceAuth = data.getOrDefault("source_auth", "FIREBASE").toString();

                    // Vérifier si l'utilisateur existe déjà par email
                    Optional<Utilisateur> existingUser = utilisateurRepository.findByEmail(email);

                    if (existingUser.isEmpty()) {
                        // Créer un nouvel utilisateur
                        Utilisateur utilisateur = new Utilisateur();
                        utilisateur.setEmail(email);
                        utilisateur.setSourceAuth(sourceAuth);
                        utilisateur.setDateCreation(extractDate(data.get("date_creation")));
                        utilisateurRepository.save(utilisateur);

                        // Créer les infos utilisateur
                        UtilisateurInfo info = new UtilisateurInfo();
                        info.setIdUtilisateur(utilisateur.getIdUtilisateur());
                        info.setNom(data.getOrDefault("nom", "").toString());
                        info.setPrenom(data.getOrDefault("prenom", "").toString());
                        info.setDateDebut(utilisateur.getDateCreation());
                        utilisateurInfoRepository.save(info);

                        // Assigner le rôle
                        String roleCode = data.getOrDefault("role", "USER").toString();
                        Role role = roleRepository.findByCode(roleCode)
                                .orElse(roleRepository.findByCode("USER")
                                        .orElseThrow(() -> new RuntimeException("Rôle USER non trouvé")));

                        UtilisateurRole utilisateurRole = new UtilisateurRole();
                        utilisateurRole.setIdUtilisateur(utilisateur.getIdUtilisateur());
                        utilisateurRole.setIdRole(role.getIdRole());
                        utilisateurRole.setDateDebut(utilisateur.getDateCreation());
                        utilisateurRoleRepository.save(utilisateurRole);

                        // Assigner l'état du compte
                        String etatCode = data.getOrDefault("etat_compte", "ACTIF").toString();
                        EtatCompte etat = etatCompteRepository.findByCode(etatCode)
                                .orElse(etatCompteRepository.findByCode("ACTIF")
                                        .orElseThrow(() -> new RuntimeException("État ACTIF non trouvé")));

                        UtilisateurEtat utilisateurEtat = new UtilisateurEtat();
                        utilisateurEtat.setIdUtilisateur(utilisateur.getIdUtilisateur());
                        utilisateurEtat.setIdEtat(etat.getIdEtat());
                        utilisateurEtat.setDateDebut(utilisateur.getDateCreation());
                        utilisateurEtatRepository.save(utilisateurEtat);

                        created++;
                        logger.info("Utilisateur créé: {}", utilisateur.getIdUtilisateur());
                    } else {
                        updated++;
                        logger.info("Utilisateur existant: {}", existingUser.get().getIdUtilisateur());
                    }

                } catch (Exception e) {
                    logger.error("Erreur lors de la synchronisation du document {}: {}", doc.getId(), e.getMessage());
                    errors++;
                }
            }

            result.put("status", "success");
            result.put("created", created);
            result.put("updated", updated);
            result.put("errors", errors);
            result.put("total", documents.size() - 1);

        } catch (InterruptedException | ExecutionException e) {
            logger.error("Erreur lors de la synchronisation des utilisateurs", e);
            result.put("status", "error");
            result.put("message", e.getMessage());
        }

        return result;
    }

    /**
     * Synchroniser toutes les données (utilisateurs + signalements)
     */
    public Map<String, Object> syncAllFromFirestore() {
        Map<String, Object> result = new HashMap<>();
        
        if (firestore == null) {
            result.put("status", "error");
            result.put("message", "Firestore n'est pas configuré");
            return result;
        }

        logger.info("Début de la synchronisation complète Firestore → PostgreSQL");

        // Synchroniser les utilisateurs d'abord
        Map<String, Object> utilisateursResult = syncUtilisateursFromFirestore();
        
        // Synchroniser les signalements
        Map<String, Object> signalementsResult = syncSignalementsFromFirestore();

        result.put("status", "success");
        result.put("utilisateurs", utilisateursResult);
        result.put("signalements", signalementsResult);
        result.put("timestamp", LocalDateTime.now().toString());

        logger.info("Synchronisation complète terminée");

        return result;
    }

    /**
     * Extraire une LocalDateTime depuis un objet Firestore
     */
    private LocalDateTime extractDate(Object dateObj) {
        if (dateObj == null) {
            return LocalDateTime.now();
        }

        try {
            if (dateObj instanceof com.google.cloud.Timestamp) {
                com.google.cloud.Timestamp timestamp = (com.google.cloud.Timestamp) dateObj;
                return LocalDateTime.ofInstant(timestamp.toDate().toInstant(), ZoneId.systemDefault());
            } else if (dateObj instanceof Date) {
                return LocalDateTime.ofInstant(((Date) dateObj).toInstant(), ZoneId.systemDefault());
            }
        } catch (Exception e) {
            logger.warn("Erreur lors de la conversion de date: {}", e.getMessage());
        }

        return LocalDateTime.now();
    }
}
