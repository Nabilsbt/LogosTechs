package com.ms.apigateway.demoapigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class DemoApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApiGatewayApplication.class, args);
	}


	@Bean
	public RouteLocator  gatewayRoutes(RouteLocatorBuilder builder)
	{
		return builder.routes()
				.route("routecandidat",r->r.path("/candidats/**")
						.uri("lb://demoCandidat5SE2"))
				.route("routejob",r->r.path("/jobs/**")
						.uri("lb://MS-job-s"))
				.route("pharmacie-service", r -> r.path("/pharmacie/**")
						.filters(f -> f.stripPrefix(1)) // <-- supprime /pharmacie
						.uri("lb://PHARMACIE"))
				.build();



	}
}
