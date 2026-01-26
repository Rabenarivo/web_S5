package com.example.demo.controller;

import com.example.demo.DTO.AuthResponse;
import com.example.demo.DTO.LoginRequest;
// import com.example.demo.DTO.AuthResponse;
// import com.example.demo.DTO.InscriptionRequest;
// import com.example.demo.DTO.LoginRequest;
// import com.example.demo.DTO.UtilisateurResponse;
import com.example.demo.service.AuthentificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthentificationController {

    @Autowired
    private AuthentificationService authentificationService;

        /**
     * Endpoint de connexion
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> connecter(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authentificationService.connecter(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            AuthResponse errorResponse = new AuthResponse(false, "Erreur lors de la connexion: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint pour débloquer un compte (admin)
     * POST /api/auth/unblock/{userId}
     */
    @PostMapping("/unblock/{userId}")
    public ResponseEntity<AuthResponse> debloquerCompte(@PathVariable("userId") UUID userId) {
        try {
            authentificationService.debloquerCompte(userId);
            AuthResponse response = new AuthResponse(true, "Compte débloqué avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse errorResponse = new AuthResponse(false, "Erreur lors du déblocage: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }



}
