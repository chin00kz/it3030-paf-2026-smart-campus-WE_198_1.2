package smart_campus_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import smart_campus_backend.model.Notification;
import smart_campus_backend.repository.NotificationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public Notification createNotification(Long userId, String title, String message, String link) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .link(link)
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll(
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        );
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
