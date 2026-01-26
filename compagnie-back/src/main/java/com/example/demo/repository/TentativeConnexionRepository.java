package com.example.demo.repository;

import com.example.demo.entite.TentativeConnexion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TentativeConnexionRepository extends JpaRepository<TentativeConnexion, Long> {
    
    @Query("SELECT t FROM TentativeConnexion t WHERE t.idUtilisateur = :idUtilisateur " +
           "ORDER BY t.dateTentative DESC")
    List<TentativeConnexion> findRecentTentativesByUtilisateur(@Param("idUtilisateur") UUID idUtilisateur);
    
    @Query("SELECT COUNT(t) FROM TentativeConnexion t WHERE t.idUtilisateur = :idUtilisateur " +
           "AND t.succes = false AND t.dateTentative > :since " +
           "AND NOT EXISTS (SELECT tc FROM TentativeConnexion tc WHERE tc.idUtilisateur = :idUtilisateur " +
           "AND tc.succes = true AND tc.dateTentative > t.dateTentative AND tc.dateTentative > :since)")
    long countEchecsConsecutifsDepuis(@Param("idUtilisateur") UUID idUtilisateur, 
                                       @Param("since") LocalDateTime since);
}
