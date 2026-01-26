package com.example.demo.repository;

import com.example.demo.entite.SignalementDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SignalementDetailRepository extends JpaRepository<SignalementDetail, Long> {
    
    Optional<SignalementDetail> findByIdSignalementAndDateFinIsNull(UUID idSignalement);
}
