package com.esprit.microservice.hopital.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(
        name = "hopital",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "nom"),
                @UniqueConstraint(columnNames = "email")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Hopital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_hopital")
    private Long idHopital;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 3, max = 100, message = "Le nom doit contenir entre 3 et 100 caractères")
    @Column(nullable = false, length = 100)
    private String nom;

    @NotBlank(message = "L'adresse est obligatoire")
    @Size(max = 255, message = "L'adresse ne doit pas dépasser 255 caractères")
    @Column(nullable = false, length = 255)
    private String adresse;

    @Pattern(
            regexp = "^(\\+?\\d{1,4}[-\\s]?)?(\\d{8,15})$",
            message = "Numéro de téléphone invalide (ex: +216 71 123 456)"
    )
    @Column(length = 20)
    private String telephone;

    @Email(message = "Email invalide")
    @Size(max = 100, message = "L'email ne doit pas dépasser 100 caractères")
    @Column(unique = true, length = 100)
    private String email;

    @Size(max = 50, message = "Le type ne doit pas dépasser 50 caractères")
    @Column(length = 50)
    private String type; // ex: public, privé, clinique

    @Min(value = 0, message = "La capacité doit être positive")
    @Max(value = 10000, message = "Capacité maximale : 10000 lits")
    @Column(name = "capacite_lits")
    private Integer capaciteLits;
}