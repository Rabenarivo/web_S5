package com.example.demo.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tentative_connexion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TentativeConnexion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tentative")
    private Long idTentative;

    @Column(name = "id_utilisateur")
    private UUID idUtilisateur;

    @Column(name = "date_tentative", nullable = false)
    private LocalDateTime dateTentative;

    @Column(name = "succes", nullable = false)
    private Boolean succes;

    @PrePersist
    public void prePersist() {
        if (dateTentative == null) {
            dateTentative = LocalDateTime.now();
        }
    }
}
