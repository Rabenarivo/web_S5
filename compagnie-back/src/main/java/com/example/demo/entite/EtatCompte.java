package com.example.demo.entite;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "etat_compte")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EtatCompte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_etat")
    private Long idEtat;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code; // ACTIF | INACTIF | BLOQUE
}
