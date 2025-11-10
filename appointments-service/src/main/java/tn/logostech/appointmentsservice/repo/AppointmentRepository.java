package tn.logostech.appointmentsservice.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.logostech.appointmentsservice.domain.Appointment;

import java.time.OffsetDateTime;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    Page<Appointment> findByDoctorIdAndStartTimeBetween(Long doctorId,
                                                        OffsetDateTime from,
                                                        OffsetDateTime to,
                                                        Pageable pageable);

    // chevauchement: (existing.start < newEnd) AND (existing.end > newStart)
    boolean existsByDoctorIdAndStartTimeLessThanAndEndTimeGreaterThan(
            Long doctorId, OffsetDateTime newEnd, OffsetDateTime newStart
    );
}
