package com.example.demo.repository;

import com.example.demo.entite.UtilisateurRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UtilisateurRoleRepository extends JpaRepository<UtilisateurRole, Long> {
    
    List<UtilisateurRole> findByIdUtilisateurAndDateFinIsNull(UUID idUtilisateur);
}
