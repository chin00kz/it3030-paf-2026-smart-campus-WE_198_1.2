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
    private final smart_campus_backend.service.GoogleAuthService googleAuthService;
    private final smart_campus_backend.service.AuditLogService auditLogService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (user.getStatus() == smart_campus_backend.model.UserStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Your account is currently on hold. Please wait for an administrator to activate it.");
            }
            
            if (user.getStatus() == smart_campus_backend.model.UserStatus.BANNED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Your account has been banned. Please contact support.");
            }

            // Using plain text comparison as requested for current dev stage
            if (user.getPassword() != null && user.getPassword().equals(request.getPassword())) {
                // Log the login
                auditLogService.log(
                    smart_campus_backend.model.AuditAction.LOGIN, 
                    user.getName(), 
                    user.getEmail(), 
                    user.getId().toString(), 
                    "User logged in via local credentials"
                );

                AuthResponse response = AuthResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .status(user.getStatus().name())
                        .token("mock-jwt-token-" + user.getId())
                        .build();
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody smart_campus_backend.dto.GoogleAuthRequest request) {
        try {
            User user = googleAuthService.verifyAndResolveUser(request.getCredential());

            if (user.getStatus() == smart_campus_backend.model.UserStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Your account is currently on hold. Please wait for an administrator to activate your account.");
            }
            
            if (user.getStatus() == smart_campus_backend.model.UserStatus.BANNED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Your account has been banned.");
            }

            // Log the login
            auditLogService.log(
                smart_campus_backend.model.AuditAction.LOGIN, 
                user.getName(), 
                user.getEmail(), 
                user.getId().toString(), 
                "User logged in via Google OAuth"
            );

            AuthResponse response = AuthResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .status(user.getStatus().name())
                    .token("mock-jwt-token-" + user.getId())
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google authentication failed: " + e.getMessage());
        }
    }
}
