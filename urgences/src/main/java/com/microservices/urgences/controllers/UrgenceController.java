package com.microservices.urgences.controllers;

import com.microservices.urgences.entities.Priority;
import com.microservices.urgences.entities.Status;
import com.microservices.urgences.entities.Urgence;
import com.microservices.urgences.services.UrgenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/urgences")
@CrossOrigin(origins = "*")
public class UrgenceController {
    
    @Autowired
    private UrgenceService urgenceService;
    
    @GetMapping
    public ResponseEntity<List<Urgence>> getAllUrgences() {
        List<Urgence> urgences = urgenceService.getAllUrgences();
        return ResponseEntity.ok(urgences);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Urgence> getUrgenceById(@PathVariable Long id) {
        Optional<Urgence> urgence = urgenceService.getUrgenceById(id);
        return urgence.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Urgence>> getUrgencesByStatus(@PathVariable Status status) {
        List<Urgence> urgences = urgenceService.getUrgencesByStatus(status);
        return ResponseEntity.ok(urgences);
    }
    
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Urgence>> getUrgencesByPriority(@PathVariable Priority priority) {
        List<Urgence> urgences = urgenceService.getUrgencesByPriority(priority);
        return ResponseEntity.ok(urgences);
    }
    
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Urgence>> getUrgencesByDoctor(@PathVariable Long doctorId) {
        List<Urgence> urgences = urgenceService.getUrgencesByDoctor(doctorId);
        return ResponseEntity.ok(urgences);
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<Urgence>> getPendingUrgences() {
        List<Urgence> urgences = urgenceService.getPendingUrgences();
        return ResponseEntity.ok(urgences);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Urgence>> searchUrgencesByPatientName(@RequestParam String name) {
        List<Urgence> urgences = urgenceService.searchUrgencesByPatientName(name);
        return ResponseEntity.ok(urgences);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<Urgence>> getUrgencesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Urgence> urgences = urgenceService.getUrgencesByDateRange(startDate, endDate);
        return ResponseEntity.ok(urgences);
    }
    
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> countUrgencesByStatus(@PathVariable Status status) {
        Long count = urgenceService.countUrgencesByStatus(status);
        return ResponseEntity.ok(count);
    }
    
    @PostMapping
    public ResponseEntity<Urgence> createUrgence(@RequestBody Urgence urgence) {
        try {
            Urgence createdUrgence = urgenceService.createUrgence(urgence);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUrgence);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Urgence> updateUrgence(@PathVariable Long id, @RequestBody Urgence urgenceDetails) {
        try {
            Urgence updatedUrgence = urgenceService.updateUrgence(id, urgenceDetails);
            return ResponseEntity.ok(updatedUrgence);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/triage")
    public ResponseEntity<Urgence> triageUrgence(
            @PathVariable Long id,
            @RequestParam Priority priority,
            @RequestParam Long doctorId) {
        try {
            Urgence triagedUrgence = urgenceService.triageUrgence(id, priority, doctorId);
            return ResponseEntity.ok(triagedUrgence);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/start-treatment")
    public ResponseEntity<Urgence> startTreatment(
            @PathVariable Long id,
            @RequestParam String roomNumber) {
        try {
            Urgence urgence = urgenceService.startTreatment(id, roomNumber);
            return ResponseEntity.ok(urgence);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/discharge")
    public ResponseEntity<Urgence> dischargePatient(@PathVariable Long id) {
        try {
            Urgence dischargedUrgence = urgenceService.dischargePatient(id);
            return ResponseEntity.ok(dischargedUrgence);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUrgence(@PathVariable Long id) {
        try {
            urgenceService.deleteUrgence(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
