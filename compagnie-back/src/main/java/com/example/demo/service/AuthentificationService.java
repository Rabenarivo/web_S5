package com.example.demo.service;

import com.example.demo.DTO.*;
import com.example.demo.entite.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthentificationService {

    private static final int MAX_TENTATIVES = 3;
    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private UtilisateurInfoRepository utilisateurInfoRepository;

    @Autowired
    private UtilisateurPasswordRepository utilisateurPasswordRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UtilisateurRoleRepository utilisateurRoleRepository;

    @Autowired
    private EtatCompteRepository etatCompteRepository;

    @Autowired
    private UtilisateurEtatRepository utilisateurEtatRepository;

    @Autowired
    private TentativeConnexionRepository tentativeConnexionRepository;


        @Transactional
    public AuthResponse connecter(LoginRequest request) {
        // Rechercher l'utilisateur par email
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (utilisateur == null) {
            // Enregistrer tentative échouée sans ID utilisateur
            enregistrerTentative(null, false);
            return new AuthResponse(false, "Email ou mot de passe incorrect");
        }

        // Vérifier l'état du compte
        UtilisateurEtat etatActuel = utilisateurEtatRepository
                .findByIdUtilisateurAndDateFinIsNull(utilisateur.getIdUtilisateur())
                .orElseThrow(() -> new RuntimeException("État du compte non trouvé"));

        EtatCompte etat = etatCompteRepository.findById(etatActuel.getIdEtat())
                .orElseThrow(() -> new RuntimeException("État non trouvé"));

        // Vérifier si le compte est bloqué
        if ("BLOQUE".equals(etat.getCode())) {
            return new AuthResponse(false, "Votre compte est bloqué suite à plusieurs tentatives de connexion échouées");
        }

        // Vérifier si le compte est inactif
        if ("INACTIF".equals(etat.getCode())) {
            return new AuthResponse(false, "Votre compte est inactif");
        }

        // Récupérer le mot de passe actuel
        UtilisateurPassword passwordActuel = utilisateurPasswordRepository
                .findByIdUtilisateurAndDateFinIsNull(utilisateur.getIdUtilisateur())
                .orElseThrow(() -> new RuntimeException("Mot de passe non trouvé"));

        // Vérifier le mot de passe
        if (!passwordEncoder.matches(request.getPassword(), passwordActuel.getPasswordHash())) {
            // Enregistrer tentative échouée
            enregistrerTentative(utilisateur.getIdUtilisateur(), false);

            // Compter les échecs consécutifs
            long echecsConsecutifs = compterEchecsConsecutifs(utilisateur.getIdUtilisateur());

            if (echecsConsecutifs >= MAX_TENTATIVES) {
                // Bloquer le compte
                bloquerCompte(utilisateur.getIdUtilisateur());
                return new AuthResponse(false, "Compte bloqué après 3 tentatives échouées");
            }

            int tentativesRestantes = MAX_TENTATIVES - (int) echecsConsecutifs;
            AuthResponse response = new AuthResponse(false, "Email ou mot de passe incorrect");
            response.setTentativesRestantes(tentativesRestantes);
            return response;
        }

        // Connexion réussie
        enregistrerTentative(utilisateur.getIdUtilisateur(), true);

        UtilisateurResponse userResponse = buildUtilisateurResponse(utilisateur);
        return new AuthResponse(true, "Connexion réussie", userResponse);
    }

    private void enregistrerTentative(UUID idUtilisateur, boolean succes) {
        TentativeConnexion tentative = new TentativeConnexion();
        tentative.setIdUtilisateur(idUtilisateur);
        tentative.setSucces(succes);
        tentative.setDateTentative(LocalDateTime.now());
        tentativeConnexionRepository.save(tentative);
    }

    /**
     * Compter les échecs consécutifs récents
     */
    private long compterEchecsConsecutifs(UUID idUtilisateur) {
        // Récupérer toutes les tentatives ordonnées par date décroissante
        List<TentativeConnexion> tentatives = tentativeConnexionRepository
                .findRecentTentativesByUtilisateur(idUtilisateur);

        long count = 0;
        for (TentativeConnexion tentative : tentatives) {
            if (tentative.getSucces()) {
                // Arrêter au premier succès
                break;
            }
            count++;
        }
        return count;
    }

    /**
     * Bloquer un compte utilisateur
     */
    @Transactional
    public void bloquerCompte(UUID idUtilisateur) {
        // Terminer l'état actuel
        UtilisateurEtat etatActuel = utilisateurEtatRepository
                .findByIdUtilisateurAndDateFinIsNull(idUtilisateur)
                .orElseThrow(() -> new RuntimeException("État actuel non trouvé"));

        etatActuel.setDateFin(LocalDateTime.now());
        utilisateurEtatRepository.save(etatActuel);

        // Créer un nouvel état BLOQUE
        EtatCompte etatBloque = etatCompteRepository.findByCode("BLOQUE")
                .orElseThrow(() -> new RuntimeException("État BLOQUE non trouvé"));

        UtilisateurEtat nouvelEtat = new UtilisateurEtat();
        nouvelEtat.setIdUtilisateur(idUtilisateur);
        nouvelEtat.setIdEtat(etatBloque.getIdEtat());
        nouvelEtat.setRaison("Bloqué après 3 tentatives de connexion échouées");
        nouvelEtat.setDateDebut(LocalDateTime.now());
        utilisateurEtatRepository.save(nouvelEtat);
    }



     private UtilisateurResponse buildUtilisateurResponse(Utilisateur utilisateur) {
        UtilisateurResponse response = new UtilisateurResponse();
        response.setIdUtilisateur(utilisateur.getIdUtilisateur());
        response.setEmail(utilisateur.getEmail());
        response.setDateCreation(utilisateur.getDateCreation());

        // Récupérer les informations
        utilisateurInfoRepository.findByIdUtilisateurAndDateFinIsNull(utilisateur.getIdUtilisateur())
                .ifPresent(info -> {
                    response.setNom(info.getNom());
                    response.setPrenom(info.getPrenom());
                });

        // Récupérer les rôles
        List<UtilisateurRole> utilisateurRoles = utilisateurRoleRepository
                .findByIdUtilisateurAndDateFinIsNull(utilisateur.getIdUtilisateur());

        List<String> roles = utilisateurRoles.stream()
                .map(ur -> roleRepository.findById(ur.getIdRole())
                        .map(Role::getCode)
                        .orElse(""))
                .collect(Collectors.toList());
        response.setRoles(roles);

        // Récupérer l'état
        utilisateurEtatRepository.findByIdUtilisateurAndDateFinIsNull(utilisateur.getIdUtilisateur())
                .ifPresent(ue -> {
                    etatCompteRepository.findById(ue.getIdEtat())
                            .ifPresent(etat -> response.setEtat(etat.getCode()));
                });

        return response;
    }

    /**
     * Débloquer un compte (pour admin)
     */
    @Transactional
    public void debloquerCompte(UUID idUtilisateur) {
        // Terminer l'état actuel
        UtilisateurEtat etatActuel = utilisateurEtatRepository
                .findByIdUtilisateurAndDateFinIsNull(idUtilisateur)
                .orElseThrow(() -> new RuntimeException("État actuel non trouvé"));

        etatActuel.setDateFin(LocalDateTime.now());
        utilisateurEtatRepository.save(etatActuel);

        // Créer un nouvel état ACTIF
        EtatCompte etatActif = etatCompteRepository.findByCode("ACTIF")
                .orElseThrow(() -> new RuntimeException("État ACTIF non trouvé"));

        UtilisateurEtat nouvelEtat = new UtilisateurEtat();
        nouvelEtat.setIdUtilisateur(idUtilisateur);
        nouvelEtat.setIdEtat(etatActif.getIdEtat());
        nouvelEtat.setRaison("Compte débloqué par un administrateur");
        nouvelEtat.setDateDebut(LocalDateTime.now());
        utilisateurEtatRepository.save(nouvelEtat);
    }

    /**
     * Récupérer la liste des utilisateurs bloqués
     */
    public List<UtilisateurResponse> getUtilisateursBloqués() {
        // Récupérer l'état BLOQUE
        EtatCompte etatBloque = etatCompteRepository.findByCode("BLOQUE")
                .orElseThrow(() -> new RuntimeException("État BLOQUE non trouvé"));

        // Trouver tous les utilisateurs avec l'état BLOQUE actif
        List<UtilisateurEtat> utilisateursBloqués = utilisateurEtatRepository
                .findAll()
                .stream()
                .filter(ue -> ue.getIdEtat().equals(etatBloque.getIdEtat()) && ue.getDateFin() == null)
                .toList();

        // Construire les réponses
        return utilisateursBloqués.stream()
                .map(ue -> {
                    Utilisateur utilisateur = utilisateurRepository.findById(ue.getIdUtilisateur())
                            .orElse(null);
                    if (utilisateur != null) {
                        return buildUtilisateurResponse(utilisateur);
                    }
                    return null;
                })
                .filter(u -> u != null)
                .collect(Collectors.toList());
    }
}