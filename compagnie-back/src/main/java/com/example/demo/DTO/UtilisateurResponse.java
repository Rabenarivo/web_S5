package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurResponse {

    private UUID idUtilisateur;
    private String email;
    private String nom;
    private String prenom;
    private List<String> roles;
    private String etat;
    private LocalDateTime dateCreation;
    private String message;
}
