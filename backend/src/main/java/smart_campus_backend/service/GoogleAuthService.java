package smart_campus_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import smart_campus_backend.model.Role;
import smart_campus_backend.model.User;
import smart_campus_backend.repository.UserRepository;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @Value("${GOOGLE_CLIENT_ID:}")
    private String clientId;

    public User verifyAndResolveUser(String accessToken) throws Exception {
        // Fetch user data from Google v3 userinfo endpoint
        String userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(accessToken);
        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

        org.springframework.http.ResponseEntity<Map> response = restTemplate.exchange(
                userInfoEndpoint,
                org.springframework.http.HttpMethod.GET,
                entity,
                Map.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Failed to fetch user data from Google");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) response.getBody();

        // 1. Verify email_verified
        // UserInfo endpoint usually only returns verified emails, but we'll check 'email_verified' claim if present
        Object emailVerified = payload.get("email_verified");
        if (emailVerified != null && !Boolean.TRUE.equals(emailVerified)) {
            throw new RuntimeException("Google email is not verified");
        }

        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        String googleSub = (String) payload.get("sub");

        if (email == null || googleSub == null) {
            throw new RuntimeException("Incomplete user data from Google");
        }

        // 2. Domain check for 'On Hold' policy
        boolean isSliitEmail = email.endsWith("@sliit.lk");

        // 3. Resolve user
        Optional<User> userBySub = userRepository.findByGoogleSub(googleSub);
        if (userBySub.isPresent()) {
            return userBySub.get();
        }

        Optional<User> userByEmail = userRepository.findByEmail(email);
        if (userByEmail.isPresent()) {
            User existingUser = userByEmail.get();
            existingUser.setGoogleSub(googleSub);
            existingUser.setAuthProvider("GOOGLE");
            return userRepository.save(existingUser);
        }

        User newUser = User.builder()
                .email(email)
                .name(name)
                .googleSub(googleSub)
                .authProvider("GOOGLE")
                .role(Role.USER)
                .active(isSliitEmail)
                .password("GOOGLE_OAUTH_MANAGED")
                .build();

        return userRepository.save(newUser);
    }
}
