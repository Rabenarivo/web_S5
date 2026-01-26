package com.example.demo.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalementRequest {
    
    private UUID idUtilisateur;
    
    @NotNull(message = "La latitude est obligatoire")
    private Double latitude;
    
    @NotNull(message = "La longitude est obligatoire")
    private Double longitude;
    
    private String source; // WEB | MOBILE | FIREBASE
}
