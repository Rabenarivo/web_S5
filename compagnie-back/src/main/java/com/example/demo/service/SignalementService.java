package com.example.demo.service;

import com.example.demo.DTO.SignalementRequest;
import com.example.demo.DTO.SignalementResponse;
import com.example.demo.DTO.UpdateSignalementRequest;
import com.example.demo.entite.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
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

}