package tn.esprit.gestionpharmacie.service;

import tn.esprit.gestionpharmacie.Entity.Pharmacie;

import java.util.List;

public interface PharmacieService {

    Pharmacie ajouterPharmacie(Pharmacie pharmacie);

    List<Pharmacie> getAllPharmacies();

    Pharmacie updatePharmacie(Long idPharmacie, Pharmacie pharmacie);

    void deletePharmacie(Long idPharmacie);

    List<Pharmacie> searchPharmacie(String keyword);

    Pharmacie getPharmacieById(Long idPharmacie);
}
