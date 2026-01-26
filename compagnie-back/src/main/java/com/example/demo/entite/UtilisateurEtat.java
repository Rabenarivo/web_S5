package com.example.demo.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "utilisateur_etat")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurEtat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilisateur_etat")
    private Long idUtilisateurEtat;

    @Column(name = "id_utilisateur", nullable = false)
    private UUID idUtilisateur;

    @Column(name = "id_etat", nullable = false)
    private Long idEtat;

    @Column(name = "raison", length = 255)
    private String raison;

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
