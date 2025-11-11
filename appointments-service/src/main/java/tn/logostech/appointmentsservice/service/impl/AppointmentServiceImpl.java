package tn.logostech.appointmentsservice.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tn.logostech.appointmentsservice.domain.Appointment;
import tn.logostech.appointmentsservice.domain.AppointmentStatus;
import tn.logostech.appointmentsservice.repo.AppointmentRepository;
import tn.logostech.appointmentsservice.service.AppointmentService;
import tn.logostech.appointmentsservice.web.dto.*;

import java.time.OffsetDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository repo;

    @Override
    public AppointmentResponse create(CreateAppointmentRequest req) {
        validateTimes(req.getStartTime(), req.getEndTime());
        boolean overlap = repo.existsByDoctorIdAndStartTimeLessThanAndEndTimeGreaterThan(
                req.getDoctorId(), req.getEndTime(), req.getStartTime()
        );
        if (overlap) throw new IllegalArgumentException("Le médecin a déjà un rendez-vous sur ce créneau.");

        Appointment a = Appointment.builder()
                .patientId(req.getPatientId())
                .doctorId(req.getDoctorId())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .reason(req.getReason())
                .status(AppointmentStatus.PENDING)
                .build();

        return toDto(repo.save(a));
    }

    @Override
    public AppointmentResponse update(Long id, UpdateAppointmentRequest req) {
        validateTimes(req.getStartTime(), req.getEndTime());

        Appointment a = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        boolean overlap = repo.existsByDoctorIdAndStartTimeLessThanAndEndTimeGreaterThan(
                a.getDoctorId(), req.getEndTime(), req.getStartTime()
        );
        if (overlap) throw new IllegalArgumentException("Chevauchement de créneau pour ce médecin.");

        a.setStartTime(req.getStartTime());
        a.setEndTime(req.getEndTime());
        a.setReason(req.getReason());
        return toDto(a);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new EntityNotFoundException("Appointment not found");
        repo.deleteById(id);
    }

    @Override
    public AppointmentResponse get(Long id) {
        return repo.findById(id).map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
    }

    @Override
    public Page<AppointmentResponse> byDoctor(Long doctorId, Pageable pageable) {
        return repo.findByDoctorId(doctorId, pageable).map(this::toDto);
    }

    @Override
    public Page<AppointmentResponse> byPatient(Long patientId, Pageable pageable) {
        return repo.findByPatientId(patientId, pageable).map(this::toDto);
    }

    @Override
    public Page<AppointmentResponse> byDoctorAndRange(Long doctorId,
                                                      OffsetDateTime from,
                                                      OffsetDateTime to,
                                                      Pageable pageable) {
        return repo.findByDoctorIdAndStartTimeBetween(doctorId, from, to, pageable).map(this::toDto);
    }

    @Override
    public AppointmentResponse changeStatus(Long id, AppointmentStatus status) {
        Appointment a = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        a.setStatus(status);
        return toDto(a);
    }

    private void validateTimes(OffsetDateTime start, OffsetDateTime end){
        if (start == null || end == null || !end.isAfter(start)) {
            throw new IllegalArgumentException("Intervalle invalide : endTime doit être > startTime");
        }
    }

    private AppointmentResponse toDto(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();
        r.setId(a.getId());
        r.setPatientId(a.getPatientId());
        r.setDoctorId(a.getDoctorId());
        r.setStartTime(a.getStartTime());
        r.setEndTime(a.getEndTime());
        r.setStatus(a.getStatus());
        r.setReason(a.getReason());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }

    @Override
    @Transactional(value = Transactional.TxType.SUPPORTS)
    public Page<AppointmentResponse> list(Pageable pageable) {
        return repo.findAll(pageable).map(this::toDto);
    }


}
