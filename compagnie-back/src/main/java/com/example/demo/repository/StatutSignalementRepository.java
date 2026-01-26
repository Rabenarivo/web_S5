package com.example.demo.repository;

import com.example.demo.entite.StatutSignalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatutSignalementRepository extends JpaRepository<StatutSignalement, Long> {
    
    Optional<StatutSignalement> findByCode(String code);
}
