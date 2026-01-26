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