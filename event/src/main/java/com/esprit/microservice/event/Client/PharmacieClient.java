package com.esprit.microservice.event.Client;

import com.esprit.microservice.event.dto.PharmacieDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "pharmacie-service", url = "http://localhost:8083")
public interface PharmacieClient {
    @GetMapping("/api/pharmacies")
    List<PharmacieDTO> getAllPharmacies();

    @GetMapping("/api/pharmacies/{idPharmacie}")
    PharmacieDTO getPharmacieById(@PathVariable("idPharmacie") Long idPharmacie);
}

