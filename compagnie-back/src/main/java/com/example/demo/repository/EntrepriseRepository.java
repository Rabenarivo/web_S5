package com.example.demo.repository;

import com.example.demo.entite.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    
    Optional<Entreprise> findByNom(String nom);
}
