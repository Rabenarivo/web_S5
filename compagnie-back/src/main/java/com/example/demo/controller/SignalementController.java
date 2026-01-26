package com.example.demo.controller;

import com.example.demo.DTO.SignalementRequest;
import com.example.demo.DTO.SignalementResponse;
import com.example.demo.DTO.UpdateSignalementRequest;
import com.example.demo.service.SignalementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/signalements")
@CrossOrigin(origins = "*")
public class SignalementController {

    @Autowired
    private SignalementService signalementService;

   
    /**
     * Récupérer un signalement par ID
     * GET /api/signalements/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<SignalementResponse> getSignalementById(@PathVariable("id") UUID id) {
        try {
            SignalementResponse signalement = signalementService.getSignalementById(id);
            return ResponseEntity.ok(signalement);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

}
