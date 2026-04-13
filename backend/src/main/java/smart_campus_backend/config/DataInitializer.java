package smart_campus_backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import smart_campus_backend.model.Role;
import smart_campus_backend.model.User;
import smart_campus_backend.model.UserStatus;
import smart_campus_backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("Main Admin",       "admin@smartcampus.com", "admin123", Role.ADMIN,       UserStatus.ACTIVE);
        seedUser("Chanuka (Super)", "chanuka@sliit.lk",      "87654321", Role.SUPER_ADMIN, UserStatus.ACTIVE);
    }

    private void seedUser(String name, String email, String password, Role role, UserStatus status) {
        var existing = userRepository.findByEmail(email);

        if (existing.isEmpty()) {
            // Create new user with hashed password
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .status(status)
                    .authProvider("LOCAL")
                    .build();
            userRepository.save(user);
            System.out.println("[DataInitializer] Created missing user: " + email + " (" + role + ")");
        } else {
            // User exists — check if password or role needs fixing
            User user = existing.get();
            boolean changed = false;

            // Fix plain-text or incorrect password (BCrypt hashes always start with $2)
            if (user.getPassword() == null || !user.getPassword().startsWith("$2")) {
                user.setPassword(passwordEncoder.encode(password));
                System.out.println("[DataInitializer] Re-hashed password for: " + email);
                changed = true;
            }

            // Ensure correct role (important for Super Admin)
            if (user.getRole() != role) {
                user.setRole(role);
                System.out.println("[DataInitializer] Corrected role for: " + email + " -> " + role);
                changed = true;
            }

            // Ensure correct status
            if (user.getStatus() != status) {
                user.setStatus(status);
                changed = true;
            }

            if (changed) {
                userRepository.save(user);
            }
        }
    }
}
