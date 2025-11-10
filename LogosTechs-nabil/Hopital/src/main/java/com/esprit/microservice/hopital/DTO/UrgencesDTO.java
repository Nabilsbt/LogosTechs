// src/main/java/com/esprit/microservice/hopital/dto/UrgenceDTO.java
package com.esprit.microservice.hopital.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UrgencesDTO {
    private Long id;
    private String patientName;
    private String patientAge;
    private String symptoms;
    private String description;
    private String priority;  // HIGH, MEDIUM, LOW (valeur de l'enum)
    private String status;    // WAITING, IN_PROGRESS, COMPLETED (valeur de l'enum)
    private Long assignedDoctorId;
    private String roomNumber;
    private LocalDateTime arrivalTime;
    private LocalDateTime triageTime;
    private LocalDateTime treatmentStartTime;
    private LocalDateTime dischargeTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}