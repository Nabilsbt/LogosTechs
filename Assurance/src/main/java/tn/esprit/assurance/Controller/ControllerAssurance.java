package tn.esprit.assurance.Controller;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.assurance.DTO.DTOevent;
import tn.esprit.assurance.Entity.Assurance;
import tn.esprit.assurance.Service.IService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/assurances")
@AllArgsConstructor
public class ControllerAssurance {

    @Autowired
     IService service;

    // ➕ Ajouter
    @PostMapping("/add")
    public ResponseEntity<Assurance> addAssurance(@RequestBody Assurance assurance) {
        Assurance saved = service.addAssurance(assurance);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // 🔁 Mettre à jour
    @PutMapping("/update/{id}")
    public ResponseEntity<Assurance> updateAssurance(@PathVariable Long id, @RequestBody Assurance assurance) {
        Assurance updated = service.updateAssurance(id, assurance);
        if (updated != null)
            return new ResponseEntity<>(updated, HttpStatus.OK);
        else
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteAssurance(@PathVariable Long id) {
        if(service.getAssuranceById(id).isPresent()) {
            service.deleteAssurance(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // 📋 Afficher tout
    @GetMapping("/all")
    public ResponseEntity<List<Assurance>> getAllAssurances() {
        List<Assurance> assurances = service.getAllAssurances();
        return new ResponseEntity<>(assurances, HttpStatus.OK);
    }

    // 🔍 Afficher par ID
    @GetMapping("/{id}")
    public ResponseEntity<Assurance> getAssuranceById(@PathVariable Long id) {
        Optional<Assurance> assurance = service.getAssuranceById(id);
        return assurance.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


    @GetMapping("/events")
    public List<DTOevent> getAllEvents() {
        return service.getEventsFromEventService();
    }

    @GetMapping("/events/{id}")
    public DTOevent getEventById(@PathVariable Long id) {
        return service.getEventDetails(id);
    }
}
