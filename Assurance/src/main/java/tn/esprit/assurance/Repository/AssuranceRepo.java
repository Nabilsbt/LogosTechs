package tn.esprit.assurance.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.assurance.Entity.Assurance;
@Repository
public interface AssuranceRepo extends JpaRepository<Assurance, Long> {
}
