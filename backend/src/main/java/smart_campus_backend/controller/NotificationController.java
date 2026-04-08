package smart_campus_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import smart_campus_backend.model.Notification;
import smart_campus_backend.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return notificationService.getNotificationsForUser(userId);
    }

    @GetMapping("/user/{userId}/unread-count")
    public Long getUnreadCount(@PathVariable Long userId) {
        return notificationService.getUnreadCount(userId);
    }

    @PatchMapping("/{notificationId}/read")
    public void markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
    }

    @PatchMapping("/user/{userId}/read-all")
    public void markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
    }
}
