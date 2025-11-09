package tn.esprit.gestionpharmacie.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pharmacie")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pharmacie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPharmacie;

    private String nom;
    private String adresse;
    private String telephone;
    private String email;
}
