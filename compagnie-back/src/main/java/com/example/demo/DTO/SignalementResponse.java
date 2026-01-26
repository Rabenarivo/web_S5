package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalementResponse {
    
    private UUID idSignalement;
    private UUID idUtilisateur;
    private Double latitude;
    private Double longitude;
    private String source;
    private LocalDateTime dateCreation;
    
    // Statut actuel
    private String statut;
    
    // Détails (si disponibles)
    private BigDecimal surfaceM2;
    private BigDecimal budget;
    private String entreprise;
}
