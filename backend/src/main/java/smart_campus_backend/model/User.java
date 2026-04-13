package smart_campus_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true, columnDefinition = "varchar(255) default null")
    private String password;

    @Column(unique = true)
    private String googleSub;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String authProvider = "LOCAL";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 50)
    private UserStatus status = UserStatus.PENDING;
}
