package com.example.demo.repository;

import com.example.demo.entite.SignalementStatut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SignalementStatutRepository extends JpaRepository<SignalementStatut, Long> {
    
    Optional<SignalementStatut> findByIdSignalementAndDateFinIsNull(UUID idSignalement);
}
