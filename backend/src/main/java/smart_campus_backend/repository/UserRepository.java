package smart_campus_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smart_campus_backend.model.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleSub(String googleSub);
    java.util.List<User> findByRole(smart_campus_backend.model.Role role);
    long countByRole(smart_campus_backend.model.Role role);
    long countByStatus(smart_campus_backend.model.UserStatus status);
}
