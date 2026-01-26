package com.example.demo.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSignalementRequest {
    
    @NotNull(message = "L'ID du signalement est obligatoire")
    private UUID idSignalement;
    
    private String statut; // NOUVEAU | EN_COURS | TERMINE
    
    private BigDecimal surfaceM2;
    private BigDecimal budget;
    private Long idEntreprise;
}
