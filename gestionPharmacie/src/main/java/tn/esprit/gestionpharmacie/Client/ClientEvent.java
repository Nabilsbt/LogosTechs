package tn.esprit.gestionpharmacie.Client;

import tn.esprit.gestionpharmacie.dto.EventDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "EVENT-SERVICE") // Plus besoin de URL avec Eureka
public interface ClientEvent {

    @GetMapping("/api/events")
    List<EventDTO> getAllEvents();

    @GetMapping("/api/events/{id}")
    EventDTO getEventById(@PathVariable Long id);

    @PostMapping("/api/events")
    EventDTO createEvent(@RequestBody EventDTO eventDTO);

    @PutMapping("/api/events/{id}")
    EventDTO updateEvent(@PathVariable Long id, @RequestBody EventDTO eventDTO);

    @DeleteMapping("/api/events/{id}")
    void deleteEvent(@PathVariable Long id);
}