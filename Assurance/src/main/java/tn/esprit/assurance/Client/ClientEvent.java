package tn.esprit.assurance.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.assurance.DTO.DTOevent;

import java.util.List;

@FeignClient(name = "event-service", url = "http://localhost:8082")

public interface ClientEvent {
    @GetMapping("/api/events")
    List<DTOevent> getAllEvents();

    @GetMapping("/api/events/{id}")
    DTOevent getEventById(@PathVariable("id") Long id);
}
