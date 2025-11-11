package tn.logostech.appointmentsservice.web.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAppointmentRequest {
    @NotNull private OffsetDateTime startTime;
    @NotNull private OffsetDateTime endTime;
    @Size(max = 500) private String reason;
}
