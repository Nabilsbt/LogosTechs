package tn.logostech.appointmentsservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import tn.logostech.appointmentsservice.domain.AppointmentStatus;
import tn.logostech.appointmentsservice.service.AppointmentService;
import tn.logostech.appointmentsservice.web.dto.*;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService service;

    @GetMapping("/ping")
    public String ping(){ return "pong"; }

    @PostMapping
    public AppointmentResponse create(@Valid @RequestBody CreateAppointmentRequest req){
        return service.create(req);
    }

    @PutMapping("/{id}")
    public AppointmentResponse update(@PathVariable Long id,
                                      @Valid @RequestBody UpdateAppointmentRequest req){
        return service.update(id, req);
    }

    @PatchMapping("/{id}/status")
    public AppointmentResponse changeStatus(@PathVariable Long id,
                                            @RequestParam AppointmentStatus status){
        return service.changeStatus(id, status);
    }

    @GetMapping("/{id}")
    public AppointmentResponse get(@PathVariable Long id){ return service.get(id); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){ service.delete(id); }

    @GetMapping("/by-doctor/{doctorId}")
    public Page<AppointmentResponse> byDoctor(@PathVariable Long doctorId, Pageable pageable){
        return service.byDoctor(doctorId, pageable);
    }

    @GetMapping("/by-patient/{patientId}")
    public Page<AppointmentResponse> byPatient(@PathVariable Long patientId, Pageable pageable){
        return service.byPatient(patientId, pageable);
    }

    @GetMapping("/by-doctor/{doctorId}/range")
    public Page<AppointmentResponse> byDoctorAndRange(@PathVariable Long doctorId,
                                                      @RequestParam OffsetDateTime from,
                                                      @RequestParam OffsetDateTime to,
                                                      Pageable pageable){
        return service.byDoctorAndRange(doctorId, from, to, pageable);
    }
}
