package com.esprit.microservice.event.Service;

import com.esprit.microservice.event.Client.PharmacieClient;
import com.esprit.microservice.event.Entity.Event;
import com.esprit.microservice.event.Repo.EventRepo;
import com.esprit.microservice.event.dto.PharmacieDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService implements IEventService {

    @Autowired
    private EventRepo eventRepository;
    @Autowired
    private PharmacieClient pharmacieClient ;

    @Override
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement introuvable avec l'id " + id));
    }

    @Override
    public Event updateEvent(Long id, Event updatedEvent) {
        Event existingEvent = getEventById(id);
        existingEvent.setTitle(updatedEvent.getTitle());
        existingEvent.setDescription(updatedEvent.getDescription());
        existingEvent.setDate(updatedEvent.getDate());
        existingEvent.setLocation(updatedEvent.getLocation());
        existingEvent.setType(updatedEvent.getType());
        return eventRepository.save(existingEvent);
    }

    @Override
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
    @Override
    public List<PharmacieDTO> getAllPharmacies() {
        return pharmacieClient.getAllPharmacies();
    }

    @Override
    public PharmacieDTO getPharmacieById(Long idPharmacie) {
        return pharmacieClient.getPharmacieById(idPharmacie);
    }
}
