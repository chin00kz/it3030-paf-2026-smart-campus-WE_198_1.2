package smart_campus_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import smart_campus_backend.model.User;
import smart_campus_backend.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        // Defaulting status to PENDING if not specified
        if (user.getStatus() == null) {
            user.setStatus(smart_campus_backend.model.UserStatus.PENDING);
        }
        
        User savedUser = userRepository.save(user);
        
        // If user is PENDING, notify all admins
        if (savedUser.getStatus() == smart_campus_backend.model.UserStatus.PENDING) {
            List<User> admins = userRepository.findByRole(smart_campus_backend.model.Role.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification(
                    admin.getId(),
                    "New User Pending Approval",
                    "A new user (" + savedUser.getName() + ") is on hold and needs review.",
                    "/admin/user-management"
                );
            }
        }
        
        return savedUser;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        // Handle password update if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(userDetails.getPassword());
        }
        return userRepository.save(user);
    }

    public void updateStatus(Long id, smart_campus_backend.model.UserStatus status) {
        User user = getUserById(id);
        user.setStatus(status);
        userRepository.save(user);
    }
}
