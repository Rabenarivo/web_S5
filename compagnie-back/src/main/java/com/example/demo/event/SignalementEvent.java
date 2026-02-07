package com.example.demo.event;

import com.example.demo.entite.Signalement;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Événement déclenché lors de la création, mise à jour ou suppression d'un signalement
 */
@Getter
public class SignalementEvent extends ApplicationEvent {

    private final Signalement signalement;
    private final EventType eventType;

    public SignalementEvent(Object source, Signalement signalement, EventType eventType) {
        super(source);
        this.signalement = signalement;
        this.eventType = eventType;
    }

    public enum EventType {
        CREATED,
        UPDATED,
        DELETED
    }
}
