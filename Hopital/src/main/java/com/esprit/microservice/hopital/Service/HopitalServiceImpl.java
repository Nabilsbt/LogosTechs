package com.esprit.microservice.hopital.Service;

import com.esprit.microservice.hopital.Entity.Hopital;
import com.esprit.microservice.hopital.Repo.HopitalRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HopitalServiceImpl implements IHopitalService {

    private final HopitalRepository hopitalRepository;

    @Autowired
    public HopitalServiceImpl(HopitalRepository hopitalRepository) {
        this.hopitalRepository = hopitalRepository;
    }

    @Override
    public Hopital ajouterHopital(@Valid Hopital hopital) {
        // Vérification unicité nom
        if (hopitalRepository.existsByNom(hopital.getNom())) {
            throw new IllegalArgumentException("Un hôpital avec le nom '" + hopital.getNom() + "' existe déjà.");
        }
        // Vérification unicité email
        if (hopital.getEmail() != null && hopitalRepository.existsByEmail(hopital.getEmail())) {
            throw new IllegalArgumentException("Un hôpital avec l'email '" + hopital.getEmail() + "' existe déjà.");
        }
        return hopitalRepository.save(hopital);
    }

    @Override
    public List<Hopital> getAllHopitaux() {
        return hopitalRepository.findAll();
    }

    @Override
    public List<Hopital> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllHopitaux();
        }

        String lowerKeyword = keyword.toLowerCase().trim();

        return hopitalRepository.findAll().stream()
                .filter(h ->
                        h.getNom() != null && h.getNom().toLowerCase().contains(lowerKeyword) ||
                                h.getAdresse() != null && h.getAdresse().toLowerCase().contains(lowerKeyword) ||
                                h.getType() != null && h.getType().toLowerCase().contains(lowerKeyword) ||
                                h.getTelephone() != null && h.getTelephone().contains(keyword) ||
                                h.getEmail() != null && h.getEmail().toLowerCase().contains(lowerKeyword)
                )
                .collect(Collectors.toList());
    }

    @Override
    public Hopital getHopitalById(Long id) {
        return hopitalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hôpital non trouvé avec l'ID : " + id));
    }

    @Override
    public Hopital updateHopital(Long id, @Valid Hopital hopital) {
        Hopital existing = getHopitalById(id);

        // Vérifier unicité nom (sauf si même nom)
        if (!existing.getNom().equals(hopital.getNom()) && hopitalRepository.existsByNom(hopital.getNom())) {
            throw new IllegalArgumentException("Un autre hôpital utilise déjà le nom : " + hopital.getNom());
        }

        // Vérifier unicité email (sauf si même email)
        if (!existing.getEmail().equals(hopital.getEmail()) && hopitalRepository.existsByEmail(hopital.getEmail())) {
            throw new IllegalArgumentException("Un autre hôpital utilise déjà l'email : " + hopital.getEmail());
        }

        // Mise à jour des champs
        hopital.setIdHopital(id);
        return hopitalRepository.save(hopital);
    }

    @Override
    public void deleteHopital(Long id) {
        if (!hopitalRepository.existsById(id)) {
            throw new IllegalArgumentException("Impossible de supprimer : Hôpital non trouvé avec l'ID : " + id);
        }
        hopitalRepository.deleteById(id);
    }
}