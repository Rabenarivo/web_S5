package com.example.demo.repository;

import com.example.demo.entite.UtilisateurEtat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UtilisateurEtatRepository extends JpaRepository<UtilisateurEtat, Long> {
    
    Optional<UtilisateurEtat> findByIdUtilisateurAndDateFinIsNull(UUID idUtilisateur);
}
