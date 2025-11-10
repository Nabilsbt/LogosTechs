package tn.esprit.gestionpharmacie.serviceimpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.gestionpharmacie.Client.ClientEvent;
import tn.esprit.gestionpharmacie.Entity.Pharmacie;
import tn.esprit.gestionpharmacie.Repository.PharmacieRepo;
import tn.esprit.gestionpharmacie.dto.EventDTO;
import tn.esprit.gestionpharmacie.service.PharmacieService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PharmacieServiceImpl implements PharmacieService {

    private final PharmacieRepo pharmacieRepository;
    private final ClientEvent eventClient;

    @Override
    public Pharmacie ajouterPharmacie(Pharmacie pharmacie) {
        return pharmacieRepository.save(pharmacie);
    }

    @Override
    public List<Pharmacie> getAllPharmacies() {
        return pharmacieRepository.findAll();
    }

    @Override
    public Pharmacie getPharmacieById(Long idPharmacie) {
        return pharmacieRepository.findById(idPharmacie)
                .orElseThrow(() -> new RuntimeException("Pharmacie non trouvée avec l'id : " + idPharmacie));
    }
    @Override
    public List<Pharmacie> searchPharmacie(String keyword) {
        return pharmacieRepository.searchByNomOrAdresse(keyword);
    }




    @Override
    public Pharmacie updatePharmacie(Long idPharmacie, Pharmacie pharmacie) {
        Pharmacie existing = getPharmacieById(idPharmacie); // récupère l'entité existante
        existing.setNom(pharmacie.getNom());
        existing.setAdresse(pharmacie.getAdresse());
        existing.setTelephone(pharmacie.getTelephone());
        existing.setEmail(pharmacie.getEmail());
        return pharmacieRepository.save(existing); // sauvegarde les modifications
    }


    @Override
    public void deletePharmacie(Long idPharmacie) {
        pharmacieRepository.deleteById(idPharmacie);
    }
    public List<EventDTO> getAllEvents() {
        return eventClient.getAllEvents();
    }

    public EventDTO getEventById(Long eventId) {
        return eventClient.getEventById(eventId);
    }

}
