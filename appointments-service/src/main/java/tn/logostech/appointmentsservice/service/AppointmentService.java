package tn.logostech.appointmentsservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.logostech.appointmentsservice.domain.AppointmentStatus;
import tn.logostech.appointmentsservice.web.dto.*;

import java.time.OffsetDateTime;

public interface AppointmentService {
    AppointmentResponse create(CreateAppointmentRequest req);
    AppointmentResponse update(Long id, UpdateAppointmentRequest req);
    void delete(Long id);
    AppointmentResponse get(Long id);

    Page<AppointmentResponse> byDoctor(Long doctorId, Pageable pageable);
    Page<AppointmentResponse> byPatient(Long patientId, Pageable pageable);
    Page<AppointmentResponse> byDoctorAndRange(Long doctorId, OffsetDateTime from, OffsetDateTime to, Pageable pageable);

    AppointmentResponse changeStatus(Long id, AppointmentStatus status);
}
