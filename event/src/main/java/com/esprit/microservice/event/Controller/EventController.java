package com.esprit.microservice.event.Controller;


import com.esprit.microservice.event.Entity.Event;
import com.esprit.microservice.event.Service.IEventService;
import com.esprit.microservice.event.dto.PharmacieDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private IEventService eventService;

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return eventService.createEvent(event);
    }

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public Event getEventById(@PathVariable Long id) {
        return eventService.getEventById(id);
    }

    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable Long id, @RequestBody Event event) {
        return eventService.updateEvent(id, event);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }
    @GetMapping("/pharmacies")
    public List<PharmacieDTO> getAllPharmacies() {
        return eventService.getAllPharmacies();
    }

    @GetMapping("/pharmacies/{idPharmacie}")
    public PharmacieDTO getPharmacieById(@PathVariable Long idPharmacie) {
        return eventService.getPharmacieById(idPharmacie);
    }
}

