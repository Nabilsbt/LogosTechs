package tn.logostech.appointmentsservice.web.dto;

import lombok.*;
import tn.logostech.appointmentsservice.domain.AppointmentStatus;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private AppointmentStatus status;
    private String reason;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
