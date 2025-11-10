package com.esprit.microservice.event.Service;


import com.esprit.microservice.event.Entity.Event;
import com.esprit.microservice.event.dto.PharmacieDTO;

import java.util.List;

public interface IEventService {

    Event createEvent(Event event);

    List<Event> getAllEvents();

    Event getEventById(Long id);

    Event updateEvent(Long id, Event updatedEvent);

    void deleteEvent(Long id);
    List<PharmacieDTO> getAllPharmacies();

    PharmacieDTO getPharmacieById(Long idPharmacie);
}
