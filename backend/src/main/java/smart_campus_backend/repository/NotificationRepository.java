package smart_campus_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smart_campus_backend.model.Notification;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    Long countByUserIdAndIsReadFalse(Long userId);
}
