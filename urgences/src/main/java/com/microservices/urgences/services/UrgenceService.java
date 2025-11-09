package com.microservices.urgences.services;

import com.microservices.urgences.entities.Priority;
import com.microservices.urgences.entities.Status;
import com.microservices.urgences.entities.Urgence;
import com.microservices.urgences.repositories.UrgenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UrgenceService {
    
    @Autowired
    private UrgenceRepository urgenceRepository;
    
    public List<Urgence> getAllUrgences() {
        return urgenceRepository.findAll();
    }
    
    public Optional<Urgence> getUrgenceById(Long id) {
        return urgenceRepository.findById(id);
    }
    
    public List<Urgence> getUrgencesByStatus(Status status) {
        return urgenceRepository.findByStatus(status);
    }
    
    public List<Urgence> getUrgencesByPriority(Priority priority) {
        return urgenceRepository.findByPriority(priority);
    }
    
    public List<Urgence> getUrgencesByDoctor(Long doctorId) {
        return urgenceRepository.findByAssignedDoctorId(doctorId);
    }
    
    public List<Urgence> getUrgencesByStatusOrderByPriority(Status status) {
        return urgenceRepository.findByStatusOrderByPriorityAndArrivalTime(status);
    }
    
    public List<Urgence> getUrgencesByPriorityAndStatus(Priority priority, Status status) {
        return urgenceRepository.findByPriorityAndStatus(priority, status);
    }
    
    public List<Urgence> getUrgencesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return urgenceRepository.findByArrivalTimeBetween(startDate, endDate);
    }
    
    public List<Urgence> searchUrgencesByPatientName(String name) {
        return urgenceRepository.findByPatientNameContaining(name);
    }
    
    public List<Urgence> getPendingUrgences() {
        return urgenceRepository.findPendingUrgencesOrderByPriority();
    }
    
    public Long countUrgencesByStatus(Status status) {
        return urgenceRepository.countByStatus(status);
    }
    
    public Long countUrgencesByPriorityAndStatus(Priority priority, Status status) {
        return urgenceRepository.countByPriorityAndStatus(priority, status);
    }
    
    public Urgence saveUrgence(Urgence urgence) {
        return urgenceRepository.save(urgence);
    }
    
    public Urgence createUrgence(Urgence urgence) {
        urgence.setArrivalTime(LocalDateTime.now());
        urgence.setStatus(Status.WAITING);
        return urgenceRepository.save(urgence);
    }
    
    public Urgence updateUrgence(Long id, Urgence urgenceDetails) {
        Urgence urgence = urgenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Urgence not found with id: " + id));
        
        urgence.setPatientName(urgenceDetails.getPatientName());
        urgence.setPatientAge(urgenceDetails.getPatientAge());
        urgence.setSymptoms(urgenceDetails.getSymptoms());
        urgence.setDescription(urgenceDetails.getDescription());
        urgence.setPriority(urgenceDetails.getPriority());
        urgence.setStatus(urgenceDetails.getStatus());
        urgence.setAssignedDoctorId(urgenceDetails.getAssignedDoctorId());
        urgence.setRoomNumber(urgenceDetails.getRoomNumber());
        
        return urgenceRepository.save(urgence);
    }
    
    public Urgence triageUrgence(Long id, Priority priority, Long doctorId) {
        Urgence urgence = urgenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Urgence not found with id: " + id));
        
        urgence.setPriority(priority);
        urgence.setStatus(Status.TRIAGED);
        urgence.setAssignedDoctorId(doctorId);
        urgence.setTriageTime(LocalDateTime.now());
        
        return urgenceRepository.save(urgence);
    }
    
    public Urgence startTreatment(Long id, String roomNumber) {
        Urgence urgence = urgenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Urgence not found with id: " + id));
        
        urgence.setStatus(Status.IN_TREATMENT);
        urgence.setRoomNumber(roomNumber);
        urgence.setTreatmentStartTime(LocalDateTime.now());
        
        return urgenceRepository.save(urgence);
    }
    
    public Urgence dischargePatient(Long id) {
        Urgence urgence = urgenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Urgence not found with id: " + id));
        
        urgence.setStatus(Status.DISCHARGED);
        urgence.setDischargeTime(LocalDateTime.now());
        
        return urgenceRepository.save(urgence);
    }
    
    public void deleteUrgence(Long id) {
        Urgence urgence = urgenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Urgence not found with id: " + id));
        urgenceRepository.delete(urgence);
    }
}
