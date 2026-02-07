package com.example.demo.firebase;

import com.example.demo.entite.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Mapper pour convertir les entités JPA en documents Firestore
 * Aplatit les données bitemporelles (ne garde que l'état actuel)
 */
@Component
public class FirestoreMapper {

    @Autowired
    private SignalementStatutRepository signalementStatutRepository;

    @Autowired
    private StatutSignalementRepository statutSignalementRepository;

    @Autowired
    private SignalementDetailRepository signalementDetailRepository;

    @Autowired
    private EntrepriseRepository entrepriseRepository;

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

    /**
     * Convertir Signalement en document Firestore
     */
    public Map<String, Object> signalementToFirestoreDocument(Signalement signalement) {
        Map<String, Object> doc = new HashMap<>();
        
        doc.put("id_signalement", signalement.getIdSignalement().toString());
        doc.put("id_utilisateur", signalement.getIdUtilisateur() != null ? 
                signalement.getIdUtilisateur().toString() : null);
        doc.put("latitude", signalement.getLatitude());
        doc.put("longitude", signalement.getLongitude());
        doc.put("source", signalement.getSource());
        doc.put("date_creation", toFirestoreTimestamp(signalement.getDateCreation()));

        // Ajouter le statut actuel
        SignalementStatut statutActuel = signalementStatutRepository
                .findByIdSignalementAndDateFinIsNull(signalement.getIdSignalement())
                .orElse(null);

        if (statutActuel != null) {
            StatutSignalement statut = statutSignalementRepository
                    .findById(statutActuel.getIdStatut()).orElse(null);
            if (statut != null) {
                doc.put("statut", statut.getCode());
                doc.put("statut_date_debut", toFirestoreTimestamp(statutActuel.getDateDebut()));
            }
        } else {
            doc.put("statut", "NOUVEAU");
        }

        // Ajouter les détails actuels (surface, budget, entreprise)
        SignalementDetail detailActuel = signalementDetailRepository
                .findByIdSignalementAndDateFinIsNull(signalement.getIdSignalement())
                .orElse(null);

        if (detailActuel != null) {
            doc.put("surface_m2", detailActuel.getSurfaceM2());
            doc.put("budget", detailActuel.getBudget());
            
            if (detailActuel.getIdEntreprise() != null) {
                Entreprise entreprise = entrepriseRepository
                        .findById(detailActuel.getIdEntreprise()).orElse(null);
                if (entreprise != null) {
                    doc.put("id_entreprise", entreprise.getIdEntreprise());
                    doc.put("entreprise_nom", entreprise.getNom());
                }
            }
        }

        return doc;
    }

    /**
     * Convertir Utilisateur en document Firestore
     */
    public Map<String, Object> utilisateurToFirestoreDocument(Utilisateur utilisateur) {
        Map<String, Object> doc = new HashMap<>();
        
        doc.put("id_utilisateur", utilisateur.getIdUtilisateur().toString());
        doc.put("email", utilisateur.getEmail());
        doc.put("source_auth", utilisateur.getSourceAuth());
        doc.put("date_creation", toFirestoreTimestamp(utilisateur.getDateCreation()));

        // Ajouter les informations actuelles (nom, prénom)
        UtilisateurInfo infoActuelle = utilisateurInfoRepository
                .findByIdUtilisateurAndDateFinIsNull(utilisateur.getIdUtilisateur())
                .orElse(null);

        if (infoActuelle != null) {
            doc.put("nom", infoActuelle.getNom());
            doc.put("prenom", infoActuelle.getPrenom());
        }

        // Ajouter le rôle actuel
        List<UtilisateurRole> rolesActuels = utilisateurRoleRepository
                .findByIdUtilisateurAndDateFinIsNull(utilisateur.getIdUtilisateur());
        
        if (!rolesActuels.isEmpty()) {
            UtilisateurRole roleActuel = rolesActuels.get(0);
            Role role = roleRepository.findById(roleActuel.getIdRole()).orElse(null);
            if (role != null) {
                doc.put("role", role.getCode());
            }
        }

        // Ajouter l'état du compte actuel
        UtilisateurEtat etatActuel = utilisateurEtatRepository
                .findByIdUtilisateurAndDateFinIsNull(utilisateur.getIdUtilisateur())
                .orElse(null);

        if (etatActuel != null) {
            EtatCompte etat = etatCompteRepository.findById(etatActuel.getIdEtat()).orElse(null);
            if (etat != null) {
                doc.put("etat_compte", etat.getCode());
            }
        }

        return doc;
    }

    /**
     * Convertir Entreprise en document Firestore
     */
    public Map<String, Object> entrepriseToFirestoreDocument(Entreprise entreprise) {
        Map<String, Object> doc = new HashMap<>();
        
        doc.put("id_entreprise", entreprise.getIdEntreprise());
        doc.put("nom", entreprise.getNom());

        return doc;
    }

    /**
     * Convertir LocalDateTime en Timestamp Firestore
     */
    private Date toFirestoreTimestamp(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    /**
     * Obtenir l'ID Firestore depuis l'UUID
     */
    public String getFirestoreDocumentId(UUID uuid) {
        return uuid.toString();
    }
}
