package com.esprit.microservice.hopital.Controller;

import com.esprit.microservice.hopital.Entity.Hopital;
import com.esprit.microservice.hopital.Service.IHopitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hopitaux")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HopitalRestController {

    private final IHopitalService hopitalService;

    // ADD
    @PostMapping("/Add")
    @ResponseStatus(HttpStatus.CREATED)
    public Hopital ajouter(@Valid @RequestBody Hopital hopital) {
        return hopitalService.ajouterHopital(hopital);
    }

    // GET ALL
    @GetMapping("/all")
    public List<Hopital> getAll() {
        return hopitalService.getAllHopitaux();
    }

    // SEARCH
    @GetMapping("/search")
    public List<Hopital> search(@RequestParam String keyword) {
        return hopitalService.search(keyword);
    }

    // GET BY ID
    @GetMapping("/getbyId/{id}")
    public Hopital getById(@PathVariable Long id) {
        return hopitalService.getHopitalById(id);
    }

    // UPDATE
    @PutMapping("/update/{id}")
    public Hopital update(@PathVariable Long id, @Valid @RequestBody Hopital hopital) {
        return hopitalService.updateHopital(id, hopital);
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        hopitalService.deleteHopital(id);
    }
}