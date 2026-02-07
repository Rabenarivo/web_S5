package com.example.demo.event;

import com.example.demo.entite.Entreprise;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Événement déclenché lors de la création ou mise à jour d'une entreprise
 */
@Getter
public class EntrepriseEvent extends ApplicationEvent {

    private final Entreprise entreprise;
    private final EventType eventType;

    public EntrepriseEvent(Object source, Entreprise entreprise, EventType eventType) {
        super(source);
        this.entreprise = entreprise;
        this.eventType = eventType;
    }

    public enum EventType {
        CREATED,
        UPDATED
    }
}
