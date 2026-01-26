package com.example.demo.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "statut_signalement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatutSignalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_statut")
    private Long idStatut;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code; // NOUVEAU | EN_COURS | TERMINE
}
