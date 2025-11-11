// src/main/java/com/esprit/microservice/hopital/client/UrgenceClient.java
package com.esprit.microservice.hopital.Client;

import com.esprit.microservice.hopital.DTO.UrgencesDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@FeignClient(name = "URGENCES-SERVICE")
public interface UrgenceClient {

    // Récupérer toutes les urgences
    @GetMapping("/api/urgences")
    List<UrgencesDTO> getAllUrgences();

    // Récupérer une urgence par ID
    @GetMapping("/api/urgences/{id}")
    UrgencesDTO getUrgenceById(@PathVariable Long id);

    // Récupérer les urgences par statut
    @GetMapping("/api/urgences/status/{status}")
    List<UrgencesDTO> getUrgencesByStatus(@PathVariable String status);

    // Récupérer les urgences par priorité
    @GetMapping("/api/urgences/priority/{priority}")
    List<UrgencesDTO> getUrgencesByPriority(@PathVariable String priority);

    // Récupérer les urgences par médecin
    @GetMapping("/api/urgences/doctor/{doctorId}")
    List<UrgencesDTO> getUrgencesByDoctor(@PathVariable Long doctorId);

    // Récupérer les urgences en attente
    @GetMapping("/api/urgences/pending")
    List<UrgencesDTO> getPendingUrgences();

    // Rechercher les urgences par nom de patient
    @GetMapping("/api/urgences/search")
    List<UrgencesDTO> searchUrgencesByPatientName(@RequestParam String name);

    // Récupérer les urgences par plage de dates
    @GetMapping("/api/urgences/date-range")
    List<UrgencesDTO> getUrgencesByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate);

    // Compter les urgences par statut
    @GetMapping("/api/urgences/count/status/{status}")
    Long countUrgencesByStatus(@PathVariable String status);
}