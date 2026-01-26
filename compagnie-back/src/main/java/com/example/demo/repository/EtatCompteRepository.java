package com.example.demo.repository;

import com.example.demo.entite.EtatCompte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EtatCompteRepository extends JpaRepository<EtatCompte, Long> {
    
    Optional<EtatCompte> findByCode(String code);
}
