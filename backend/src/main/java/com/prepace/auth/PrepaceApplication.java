package com.prepace.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PrepaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PrepaceApplication.class, args);
    }
}
