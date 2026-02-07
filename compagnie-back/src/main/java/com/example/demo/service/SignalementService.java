package com.example.demo.service;

import com.example.demo.DTO.SignalementRequest;
import com.example.demo.DTO.SignalementResponse;
import com.example.demo.DTO.UpdateSignalementRequest;
import com.example.demo.entite.*;
import com.example.demo.event.SignalementEvent;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SignalementService {

     @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private SignalementStatutRepository signalementStatutRepository;

    @Autowired
    private StatutSignalementRepository statutSignalementRepository;

    @Autowired
    private SignalementDetailRepository signalementDetailRepository;

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;


    /**
     * Créer un nouveau signalement
     */
    @Transactional
    public SignalementResponse creerSignalement(SignalementRequest request) {
        // Créer le signalement
        Signalement signalement = new Signalement();
        signalement.setIdUtilisateur(request.getIdUtilisateur());
        signalement.setLatitude(request.getLatitude());
        signalement.setLongitude(request.getLongitude());
        signalement.setSource(request.getSource() != null ? request.getSource() : "WEB");
        signalement.setDateCreation(LocalDateTime.now());
        signalementRepository.save(signalement);

        // Assigner le statut NOUVEAU par défaut
        StatutSignalement statutNouveau = statutSignalementRepository.findByCode("NOUVEAU")
                .orElseThrow(() -> new RuntimeException("Statut NOUVEAU non trouvé"));

        SignalementStatut statut = new SignalementStatut();
        statut.setIdSignalement(signalement.getIdSignalement());
        statut.setIdStatut(statutNouveau.getIdStatut());
        statut.setDateDebut(LocalDateTime.now());
        signalementStatutRepository.save(statut);

        return buildSignalementResponse(signalement);
    }

    /**
     * Récupérer tous les signalements
     */
    public List<SignalementResponse> getAllSignalements() {
        List<Signalement> signalements = signalementRepository.findAllByOrderByDateCreationDesc();
        return signalements.stream()
                .map(this::buildSignalementResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer les signalements d'un utilisateur
     */
    public List<SignalementResponse> getSignalementsByUtilisateur(UUID idUtilisateur) {
        List<Signalement> signalements = signalementRepository.findByIdUtilisateur(idUtilisateur);
        return signalements.stream()
                .map(this::buildSignalementResponse)
                .collect(Collectors.toList());
    }

        /**
     * Récupérer un signalement par ID
     */
    public SignalementResponse getSignalementById(UUID id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));
        return buildSignalementResponse(signalement);
    }

    /**
     * Mettre à jour un signalement (statut, détails)
     */
    @Transactional
    public SignalementResponse updateSignalement(UpdateSignalementRequest request) {
        Signalement signalement = signalementRepository.findById(request.getIdSignalement())
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));

        // Mettre à jour le statut si fourni
        if (request.getStatut() != null) {
            updateStatut(signalement.getIdSignalement(), request.getStatut());
        }

        // Mettre à jour les détails si fournis
        if (request.getSurfaceM2() != null || request.getBudget() != null || request.getIdEntreprise() != null) {
            updateDetails(signalement.getIdSignalement(), request);
        }

        // Publier événement pour synchronisation Firestore
        eventPublisher.publishEvent(new SignalementEvent(this, signalement, SignalementEvent.EventType.UPDATED));

        return buildSignalementResponse(signalement);
    }

    /**
     * Mettre à jour le statut d'un signalement
     */
    @Transactional
    private void updateStatut(UUID idSignalement, String codeStatut) {
        // Terminer le statut actuel
        SignalementStatut statutActuel = signalementStatutRepository
                .findByIdSignalementAndDateFinIsNull(idSignalement)
                .orElse(null);

        if (statutActuel != null) {
            statutActuel.setDateFin(LocalDateTime.now());
            signalementStatutRepository.save(statutActuel);
        }

        // Créer le nouveau statut
        StatutSignalement nouveauStatut = statutSignalementRepository.findByCode(codeStatut)
                .orElseThrow(() -> new RuntimeException("Statut " + codeStatut + " non trouvé"));

        SignalementStatut statut = new SignalementStatut();
        statut.setIdSignalement(idSignalement);
        statut.setIdStatut(nouveauStatut.getIdStatut());
        statut.setDateDebut(LocalDateTime.now());
        signalementStatutRepository.save(statut);
    }

    /**
     * Mettre à jour les détails d'un signalement
     */
    @Transactional
    private void updateDetails(UUID idSignalement, UpdateSignalementRequest request) {
        // Terminer le détail actuel
        SignalementDetail detailActuel = signalementDetailRepository
                .findByIdSignalementAndDateFinIsNull(idSignalement)
                .orElse(null);

        if (detailActuel != null) {
            detailActuel.setDateFin(LocalDateTime.now());
            signalementDetailRepository.save(detailActuel);
        }

        // Créer le nouveau détail
        SignalementDetail detail = new SignalementDetail();
        detail.setIdSignalement(idSignalement);
        detail.setSurfaceM2(request.getSurfaceM2());
        detail.setBudget(request.getBudget());
        detail.setIdEntreprise(request.getIdEntreprise());
        detail.setDateDebut(LocalDateTime.now());
        signalementDetailRepository.save(detail);
    }

    /**
     * Construire la réponse signalement
     */
    private SignalementResponse buildSignalementResponse(Signalement signalement) {
        SignalementResponse response = new SignalementResponse();
        response.setIdSignalement(signalement.getIdSignalement());
        response.setIdUtilisateur(signalement.getIdUtilisateur());
        response.setLatitude(signalement.getLatitude());
        response.setLongitude(signalement.getLongitude());
        response.setSource(signalement.getSource());
        response.setDateCreation(signalement.getDateCreation());

        // Récupérer le statut actuel
        SignalementStatut statutActuel = signalementStatutRepository
                .findByIdSignalementAndDateFinIsNull(signalement.getIdSignalement())
                .orElse(null);

        if (statutActuel != null) {
            StatutSignalement statut = statutSignalementRepository.findById(statutActuel.getIdStatut()).orElse(null);
            if (statut != null) {
                response.setStatut(statut.getCode());
            }
        }

        // Récupérer les détails actuels
        SignalementDetail detailActuel = signalementDetailRepository
                .findByIdSignalementAndDateFinIsNull(signalement.getIdSignalement())
                .orElse(null);

        if (detailActuel != null) {
            response.setSurfaceM2(detailActuel.getSurfaceM2());
            response.setBudget(detailActuel.getBudget());

            if (detailActuel.getIdEntreprise() != null) {
                Entreprise entreprise = entrepriseRepository.findById(detailActuel.getIdEntreprise()).orElse(null);
                if (entreprise != null) {
                    response.setEntreprise(entreprise.getNom());
                }
            }
        }

        return response;
    }

    /**
     * Supprimer un signalement (soft delete via statut)
     */
    @Transactional
    public void deleteSignalement(UUID idSignalement) {
        Signalement signalement = signalementRepository.findById(idSignalement)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));
        
        // Marquer comme TERMINE ou implémenter une vraie suppression si nécessaire
        updateStatut(idSignalement, "TERMINE");

        // Publier événement pour synchronisation Firestore
        eventPublisher.publishEvent(new SignalementEvent(this, signalement, SignalementEvent.EventType.DELETED));
    }

}