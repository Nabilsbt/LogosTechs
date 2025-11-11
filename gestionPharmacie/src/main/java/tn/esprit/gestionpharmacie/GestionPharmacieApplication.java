package tn.esprit.gestionpharmacie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@EnableDiscoveryClient // t5ali service enregister f eurika
@SpringBootApplication
public class GestionPharmacieApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestionPharmacieApplication.class, args);
	}

}
