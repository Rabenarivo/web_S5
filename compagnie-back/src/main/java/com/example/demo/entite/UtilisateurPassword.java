package com.example.demo.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "utilisateur_password")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurPassword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_password")
    private Long idPassword;

    @Column(name = "id_utilisateur", nullable = false)
    private UUID idUtilisateur;

    @Column(name = "password_hash", nullable = false, columnDefinition = "TEXT")
    private String passwordHash;

    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @PrePersist
    public void prePersist() {
        if (dateDebut == null) {
            dateDebut = LocalDateTime.now();
        }
    }
}
