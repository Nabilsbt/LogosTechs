package com.esprit.microservice.event.dto;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PharmacieDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPharmacie;

    private String nom;
    private String adresse;
    private String telephone;
    private String email;
}