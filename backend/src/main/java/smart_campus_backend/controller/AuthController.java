package smart_campus_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smart_campus_backend.dto.AuthRequest;
import smart_campus_backend.dto.AuthResponse;
import smart_campus_backend.model.User;
import smart_campus_backend.repository.UserRepository;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (!user.isActive()) {
                // Auto-healing for existing users who were defaulted to false during schema update
                user.setActive(true);
                userRepository.save(user);
            }

            // Using plain text comparison as requested for current dev stage
            if (user.getPassword().equals(request.getPassword())) {
                AuthResponse response = AuthResponse.builder()
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .token("mock-jwt-token-" + user.getId())
                        .build();
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }
}
