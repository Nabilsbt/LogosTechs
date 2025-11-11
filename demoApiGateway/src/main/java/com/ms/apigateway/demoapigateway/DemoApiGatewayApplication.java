package com.ms.apigateway.demoapigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@SpringBootApplication
@EnableDiscoveryClient
public class DemoApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApiGatewayApplication.class, args);
	}

	// Définition des routes Gateway
	@Bean
	public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
		return builder.routes()
				// Service Pharmacie
				.route("pharmacie-service", r -> r.path("/pharmacie/**")
						.filters(f -> f.stripPrefix(1))
						.uri("lb://PHARMACIE"))


				// Service Hopital
				.route("hopital-service", r -> r.path("/api/hopitaux/**")
						.filters(f -> f.stripPrefix(1))
						.uri("lb://hopital-service"))

				// Service Urgences
				.route("urgences-service", r -> r.path("/api/urgences/**")
						.filters(f -> f.stripPrefix(1))
						.uri("lb://urgences"))

				// Service Event
				.route("event-service", r -> r.path("/event/**")
						.filters(f -> f.stripPrefix(1))
						.uri("lb://event"))

				// Service Appointments
				.route("appointments-service", r -> r.path("/appointments/**")
						.filters(f -> f.stripPrefix(1))
						.uri("lb://appointments-service"))

				// Service Assurance
				.route("assurance-service", r -> r.path("/assurance/**")
						.filters(f -> f.stripPrefix(1))
						.uri("lb://assurance"))

				.build();
	}

	// CORS pour Angular
	@Bean
	public CorsWebFilter corsFilter() {
		CorsConfiguration corsConfig = new CorsConfiguration();
		corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
		corsConfig.setMaxAge(3600L);
		corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		corsConfig.setAllowedHeaders(Arrays.asList("*"));
		corsConfig.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", corsConfig);

		return new CorsWebFilter(source);
	}
}
