package tn.esprit.assurance.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.assurance.Entity.Assurance;
import tn.esprit.assurance.Repository.AssuranceRepo;

import java.util.List;
import java.util.Optional;

@Service
public class ServiceImp implements IService {

    private final AssuranceRepo assuranceRepo;

    // Injection via constructeur obligatoire pour que Spring l'instancie correctement
    @Autowired
    public ServiceImp(AssuranceRepo assuranceRepo) {
        this.assuranceRepo = assuranceRepo;
    }

    @Override
    public Assurance addAssurance(Assurance assurance) {
        return assuranceRepo.save(assurance);
    }

    @Override
    public Assurance updateAssurance(Long id, Assurance assurance) {
        Optional<Assurance> existing = assuranceRepo.findById(id);
        if (existing.isPresent()) {
            Assurance updated = existing.get();
            updated.setNom(assurance.getNom());
            updated.setAdresse(assurance.getAdresse());
            updated.setTelephone(assurance.getTelephone());
            updated.setEmail(assurance.getEmail());
            updated.setCouverture(assurance.getCouverture());
            return assuranceRepo.save(updated);
        }
        return null;
    }

    @Override
    public void deleteAssurance(Long id) {
        if (assuranceRepo.existsById(id)) {
            assuranceRepo.deleteById(id);
        }
    }

    @Override
    public List<Assurance> getAllAssurances() {
        return assuranceRepo.findAll();
    }

    @Override
    public Optional<Assurance> getAssuranceById(Long id) {
        return assuranceRepo.findById(id);
    }
}
