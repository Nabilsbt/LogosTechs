package tn.esprit.gestionpharmacie.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate date;
    private String location;
    private String type;  // campagne, conférence, don de sang, formation, etc.
    private Integer maxParticipants;
    private String organizer;
    private String contactEmail;
    private String status;  // PLANNED, ONGOING, COMPLETED, CANCELLED
    private LocalDate registrationDeadline;
    private Double participationFee;
    private String targetAudience;  // pharmaciens, public, étudiants, etc.
    private LocalDate createdAt;
    private LocalDate updatedAt;
}