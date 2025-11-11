package tn.logostech.appointmentsservice.web.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAppointmentRequest {
    @NotNull private Long patientId;
    @NotNull private Long doctorId;
    @NotNull private OffsetDateTime startTime;
    @NotNull private OffsetDateTime endTime;
    @Size(max = 500) private String reason;
}
