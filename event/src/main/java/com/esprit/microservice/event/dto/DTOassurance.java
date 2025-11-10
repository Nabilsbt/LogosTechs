package com.esprit.microservice.event.dto;



import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DTOassurance {
    private Long idAssurance;
    private String nom;
    private String adresse;
    private String telephone;
    private String email;
    private String couverture;
}

