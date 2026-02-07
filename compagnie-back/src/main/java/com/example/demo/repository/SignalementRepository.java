package com.example.demo.repository;

import com.example.demo.entite.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, UUID> {
    
    List<Signalement> findByIdUtilisateur(UUID idUtilisateur);
    
    List<Signalement> findBySource(String source);
    
    List<Signalement> findAllByOrderByDateCreationDesc();

     List<Signalement> findByIdUtilisateurAndLatitudeAndLongitude(UUID idUtilisateur, Double latitude, Double longitude);
}
