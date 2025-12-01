package com.example.sifenpoc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SifenPocApplication {

	public static void main(String[] args) {
		SpringApplication.run(SifenPocApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner demo(
			com.example.sifenpoc.repository.ClienteRepository repository) {
		return (args) -> {
			if (repository.count() == 0) {
				repository.save(new com.example.sifenpoc.entity.Cliente("1234567-1", "Juan Pérez",
						"Av. Mariscal López 1234", "juan.perez@email.com"));
				repository.save(new com.example.sifenpoc.entity.Cliente("80001234-5", "Empresa S.A.", "Calle Palma 567",
						"contacto@empresa.com.py"));
				repository.save(new com.example.sifenpoc.entity.Cliente("80009876-0", "Seguros del Este",
						"Av. España 890", "reclamos@seguros.com.py"));
			}
		};
	}
}
