package smart_campus_backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import smart_campus_backend.model.Role;
import smart_campus_backend.model.User;
import smart_campus_backend.model.UserStatus;
import smart_campus_backend.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        seedUser("Main Admin",       "admin@smartcampus.com", "admin123",    Role.ADMIN,     UserStatus.ACTIVE);
        seedUser("Chanuka",          "chanuka@sliit.lk",      "87654321",    Role.ADMIN,     UserStatus.ACTIVE);
    }

    private void seedUser(String name, String email, String password, Role role, UserStatus status) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(password)
                    .role(role)
                    .status(status)
                    .authProvider("LOCAL")
                    .build();
            userRepository.save(user);
            System.out.println("[DataInitializer] Created missing user: " + email + " (" + role + ")");
        }
    }
}
