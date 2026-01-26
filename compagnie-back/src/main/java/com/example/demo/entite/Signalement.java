package com.example.demo.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "signalement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Signalement {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
        name = "UUID",
        strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "id_signalement", updatable = false, nullable = false)
    private UUID idSignalement;

    @Column(name = "id_utilisateur")
    private UUID idUtilisateur;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "source", length = 20)
    private String source; // WEB | MOBILE | FIREBASE

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (source == null) {
            source = "WEB";
        }
    }
}
