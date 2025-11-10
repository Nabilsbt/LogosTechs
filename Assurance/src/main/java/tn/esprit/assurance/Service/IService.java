package tn.esprit.assurance.Service;

import tn.esprit.assurance.Entity.Assurance;
import java.util.List;
import java.util.Optional;

public interface IService {
    Assurance addAssurance(Assurance assurance);
    Assurance updateAssurance(Long id, Assurance assurance);
    void deleteAssurance(Long id);
    List<Assurance> getAllAssurances();
    Optional<Assurance> getAssuranceById(Long id);
}
