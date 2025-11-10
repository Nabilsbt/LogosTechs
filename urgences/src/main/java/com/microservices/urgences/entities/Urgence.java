package com.microservices.urgences.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "urgences")
public class Urgence {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String patientName;
    
    @Column(nullable = false)
    private String patientAge;
    
    @Column(nullable = false)
    private String symptoms;
    
    @Column(nullable = false, length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    private Priority priority;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    @Column(name = "assigned_doctor_id")
    private Long assignedDoctorId;
    
    @Column(name = "room_number")
    private String roomNumber;
    
    @Column(name = "arrival_time")
    private LocalDateTime arrivalTime;
    
    @Column(name = "triage_time")
    private LocalDateTime triageTime;
    
    @Column(name = "treatment_start_time")
    private LocalDateTime treatmentStartTime;
    
    @Column(name = "discharge_time")
    private LocalDateTime dischargeTime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructeurs
    public Urgence() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.arrivalTime = LocalDateTime.now();
        this.status = Status.WAITING;
    }
    
    public Urgence(String patientName, String patientAge, String symptoms, String description, Priority priority) {
        this();
        this.patientName = patientName;
        this.patientAge = patientAge;
        this.symptoms = symptoms;
        this.description = description;
        this.priority = priority;
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getPatientName() {
        return patientName;
    }
    
    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }
    
    public String getPatientAge() {
        return patientAge;
    }
    
    public void setPatientAge(String patientAge) {
        this.patientAge = patientAge;
    }
    
    public String getSymptoms() {
        return symptoms;
    }
    
    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Priority getPriority() {
        return priority;
    }
    
    public void setPriority(Priority priority) {
        this.priority = priority;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public Long getAssignedDoctorId() {
        return assignedDoctorId;
    }
    
    public void setAssignedDoctorId(Long assignedDoctorId) {
        this.assignedDoctorId = assignedDoctorId;
    }
    
    public String getRoomNumber() {
        return roomNumber;
    }
    
    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
    
    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }
    
    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }
    
    public LocalDateTime getTriageTime() {
        return triageTime;
    }
    
    public void setTriageTime(LocalDateTime triageTime) {
        this.triageTime = triageTime;
    }
    
    public LocalDateTime getTreatmentStartTime() {
        return treatmentStartTime;
    }
    
    public void setTreatmentStartTime(LocalDateTime treatmentStartTime) {
        this.treatmentStartTime = treatmentStartTime;
    }
    
    public LocalDateTime getDischargeTime() {
        return dischargeTime;
    }
    
    public void setDischargeTime(LocalDateTime dischargeTime) {
        this.dischargeTime = dischargeTime;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
