package com.prepace.auth.config;

import com.prepace.auth.entity.User;
import com.prepace.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "admin@prepace.com";
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);

        if (adminOpt.isEmpty()) {
            User admin = User.builder()
                    .fullName("System Admin")
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .phoneNumber("+1 (800) 555-ADMIN")
                    .targetRole("System Administrator")
                    .experienceLevel("Senior")
                    .role("ADMIN")
                    .authProvider("LOCAL")
                    .isEmailVerified(true)
                    .build();

            userRepository.save(admin);
            log.info("Initialized default ADMIN account: {}", adminEmail);
        } else {
            User admin = adminOpt.get();
            if (!"ADMIN".equals(admin.getRole())) {
                admin.setRole("ADMIN");
                userRepository.save(admin);
                log.info("Promoted account {} to ADMIN role.", adminEmail);
            }
        }
    }
}
