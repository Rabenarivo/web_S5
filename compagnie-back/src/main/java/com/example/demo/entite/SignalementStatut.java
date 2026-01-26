package com.example.demo.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "signalement_statut")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalementStatut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_signalement_statut")
    private Long idSignalementStatut;

    @Column(name = "id_signalement", nullable = false)
    private UUID idSignalement;

    @Column(name = "id_statut", nullable = false)
    private Long idStatut;

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
