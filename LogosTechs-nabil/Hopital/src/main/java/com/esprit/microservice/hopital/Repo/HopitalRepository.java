package com.esprit.microservice.hopital.Repo;

import com.esprit.microservice.hopital.Entity.Hopital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HopitalRepository extends JpaRepository<Hopital, Long> {

    Optional<Hopital> findByNom(String nom);

    Optional<Hopital> findByEmail(String email);

    boolean existsByNom(String nom);

    boolean existsByEmail(String email);
}