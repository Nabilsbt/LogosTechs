package com.esprit.microservice.hopital.Service;

import com.esprit.microservice.hopital.Entity.Hopital;
import java.util.List;

public interface IHopitalService {
    Hopital ajouterHopital(Hopital hopital);
    List<Hopital> getAllHopitaux();
    List<Hopital> search(String keyword);
    Hopital getHopitalById(Long id);
    Hopital updateHopital(Long id, Hopital hopital);
    void deleteHopital(Long id);
}