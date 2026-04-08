package smart_campus_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import smart_campus_backend.model.Role;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String status;
    private String token; // Optional placeholder for future JWT
}
