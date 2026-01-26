package com.example.demo.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "utilisateur_role")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilisateur_role")
    private Long idUtilisateurRole;

    @Column(name = "id_utilisateur", nullable = false)
    private UUID idUtilisateur;

    @Column(name = "id_role", nullable = false)
    private Long idRole;

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
