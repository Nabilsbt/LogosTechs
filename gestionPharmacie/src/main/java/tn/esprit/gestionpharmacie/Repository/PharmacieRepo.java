package tn.esprit.gestionpharmacie.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.gestionpharmacie.Entity.Pharmacie;

import java.util.List;

@Repository
public interface PharmacieRepo extends JpaRepository<Pharmacie, Long> {

    @Query("SELECT p FROM Pharmacie p WHERE LOWER(p.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.adresse) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Pharmacie> searchByNomOrAdresse(String keyword);
}

