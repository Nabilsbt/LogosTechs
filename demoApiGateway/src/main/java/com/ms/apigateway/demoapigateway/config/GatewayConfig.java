package com.ms.apigateway.demoapigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // Route pour le service utilisateur (Node.js/Express)
            .route("user-express", r -> r
                .path("/api/users/**")
                .uri("lb://USER-EXPRESS")
            )
            
            // Route pour le service urgences (Spring Boot)
            .route("urgences-service", r -> r
                .path("/api/urgences/**")
                .uri("lb://urgences")
            )
            
            // Route pour le service hopitaux (Port 8084)
            .route("hopital-service", r -> r
                .path("/api/hopitaux/**")
                .uri("lb://hopital-service")
            )
            
            // Route pour le service events
            .route("event-service", r -> r
                .path("/api/events/**")
                .uri("lb://event")
            )
            
            // Route pour le service assurances (Port 8200)
            .route("assurance-service", r -> r
                .path("/api/assurances/**")
                .uri("lb://assurance")
            )
            
            // Route pour le service pharmacies (Port 8301)
            .route("pharmacie-service", r -> r
                .path("/api/pharmacies/**")
                .uri("lb://PHARMACIE")
            )
            
            // Route pour le service appointments
            .route("appointments-service", r -> r
                .path("/api/appointments/**")
                .uri("lb://appointments-service")
            )
            
            // Route pour l'authentification Keycloak
            .route("keycloak-auth", r -> r
                .path("/auth/**")
                .uri("http://localhost:8080")
            )
            
            .build();
    }
}
