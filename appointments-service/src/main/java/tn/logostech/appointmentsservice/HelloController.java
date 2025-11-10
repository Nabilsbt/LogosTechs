package tn.logostech.appointmentsservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/api/appointments/ping")
    public String ping() {
        return "Appointments Service is up and running!";
    }
}
