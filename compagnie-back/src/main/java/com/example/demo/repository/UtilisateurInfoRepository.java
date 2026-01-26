package com.example.demo.repository;

import com.example.demo.entite.UtilisateurInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UtilisateurInfoRepository extends JpaRepository<UtilisateurInfo, Long> {
    
    Optional<UtilisateurInfo> findByIdUtilisateurAndDateFinIsNull(UUID idUtilisateur);
}
