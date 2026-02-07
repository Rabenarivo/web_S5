package com.example.demo.event;

import com.example.demo.entite.Utilisateur;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Événement déclenché lors de la création ou mise à jour d'un utilisateur
 */
@Getter
public class UtilisateurEvent extends ApplicationEvent {

    private final Utilisateur utilisateur;
    private final EventType eventType;

    public UtilisateurEvent(Object source, Utilisateur utilisateur, EventType eventType) {
        super(source);
        this.utilisateur = utilisateur;
        this.eventType = eventType;
    }

    public enum EventType {
        CREATED,
        UPDATED
    }
}
