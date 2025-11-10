package tn.esprit.gestionpharmacie.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tn.esprit.gestionpharmacie.Entity.Pharmacie;
import tn.esprit.gestionpharmacie.dto.EventDTO;
import tn.esprit.gestionpharmacie.service.PharmacieService;
import tn.esprit.gestionpharmacie.serviceimpl.PharmacieServiceImpl;

@RestController
@RequestMapping("/api/pharmacies")
@RequiredArgsConstructor

public class PharmacieController {

    private final PharmacieServiceImpl pharmacieService;

    @PostMapping
    public Mono<Pharmacie> ajouter(@RequestBody Pharmacie pharmacie) {
        return Mono.just(pharmacieService.ajouterPharmacie(pharmacie));
    }

    @GetMapping
    public Flux<Pharmacie> getAll() {
        return Flux.fromIterable(pharmacieService.getAllPharmacies());
    }

    @GetMapping("/{idPharmacie}")
    public Mono<Pharmacie> getById(@PathVariable Long idPharmacie) {
        return Mono.just(pharmacieService.getPharmacieById(idPharmacie));
    }

    @PutMapping("/{idPharmacie}")
    public Mono<Pharmacie> update(@PathVariable Long idPharmacie, @RequestBody Pharmacie pharmacie) {
        return Mono.just(pharmacieService.updatePharmacie(idPharmacie, pharmacie));
    }

    @DeleteMapping("/{idPharmacie}")
    public Mono<Void> delete(@PathVariable Long idPharmacie) {
        pharmacieService.deletePharmacie(idPharmacie);
        return Mono.empty();
    }
    @GetMapping("/search")
    public Flux<Pharmacie> search(@RequestParam String keyword) {
        return Flux.fromIterable(pharmacieService.searchPharmacie(keyword));
    }
    @GetMapping("/events")
    public Flux<EventDTO> getAllEvents() {
        return Flux.fromIterable(pharmacieService.getAllEvents());
    }

    @GetMapping("/events/{eventId}")
    public Mono<EventDTO> getEventById(@PathVariable Long eventId) {
        return Mono.just(pharmacieService.getEventById(eventId));
    }

}
