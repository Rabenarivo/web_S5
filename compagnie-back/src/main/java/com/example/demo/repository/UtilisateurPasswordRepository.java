package com.example.demo.repository;

import com.example.demo.entite.UtilisateurPassword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UtilisateurPasswordRepository extends JpaRepository<UtilisateurPassword, Long> {
    
    Optional<UtilisateurPassword> findByIdUtilisateurAndDateFinIsNull(UUID idUtilisateur);
}
