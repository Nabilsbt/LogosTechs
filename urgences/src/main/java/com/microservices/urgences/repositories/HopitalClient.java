package com.microservices.urgences.repositories;

import com.microservices.urgences.Dto.Hopital;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "hopital-service")
public interface HopitalClient {

    @GetMapping("/api/hopitaux/all")
    List<Hopital> getAllHopitaux();

    @GetMapping("/api/hopitaux/getbyId/{id}")
    Hopital getHopitalById(@PathVariable("id") Long id);
}


