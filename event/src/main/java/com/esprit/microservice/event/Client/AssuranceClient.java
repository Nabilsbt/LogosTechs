package com.esprit.microservice.event.Client;



import com.esprit.microservice.event.dto.DTOassurance;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "assurance-service", url = "http://localhost:8083/assurances")
public interface AssuranceClient {

    @GetMapping("/all")
    List<DTOassurance> getAllAssurances();

    @GetMapping("/{id}")
    DTOassurance getAssuranceById(@PathVariable("id") Long id);
}

