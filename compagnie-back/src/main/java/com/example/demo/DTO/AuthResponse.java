package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private boolean success;
    private String message;
    private UtilisateurResponse utilisateur;
    private Integer tentativesRestantes;

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponse(boolean success, String message, UtilisateurResponse utilisateur) {
        this.success = success;
        this.message = message;
        this.utilisateur = utilisateur;
    }
}
