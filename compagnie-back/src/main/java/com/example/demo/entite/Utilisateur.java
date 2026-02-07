package com.example.demo.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "utilisateur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
        name = "UUID",
        strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "id_utilisateur", updatable = false, nullable = false)
    private UUID idUtilisateur;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "source_auth", nullable = false, length = 20)
    private String sourceAuth; // LOCAL | FIREBASE

    
    @Column(name = "firebase_uid", length = 128)
    private String firebaseUid; // UID Firebase pour les utilisateurs mobiles


    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (sourceAuth == null) {
            sourceAuth = "LOCAL";
        }
    }
}