package smart_campus_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import smart_campus_backend.model.User;
import smart_campus_backend.model.Role;
import smart_campus_backend.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        // Defaulting status to PENDING if not specified
        if (user.getStatus() == null) {
            user.setStatus(smart_campus_backend.model.UserStatus.PENDING);
        }
        
        // Encrypt password
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        User savedUser = userRepository.save(user);
        
        // If user is PENDING, notify all admins
        if (savedUser.getStatus() == smart_campus_backend.model.UserStatus.PENDING) {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            admins.addAll(userRepository.findByRole(Role.SUPER_ADMIN));
            
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
        
        // Email is immutable for all users
        // We do not set user.setEmail(userDetails.getEmail())
        
        // If target is SUPER_ADMIN, only allow password change
        if (user.getRole() == Role.SUPER_ADMIN) {
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }
            // Do not update Name or Role for Super Admin to preserve system hierarchy
            return userRepository.save(user);
        }

        user.setName(userDetails.getName());
        user.setRole(userDetails.getRole());
        
        // Handle password update if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        return userRepository.save(user);
    }

    public void updateStatus(Long id, smart_campus_backend.model.UserStatus status) {
        User user = getUserById(id);
        
        // SUPER_ADMIN cannot be banned or deactivated
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new RuntimeException("Access Denied: Cannot change status of a Super Admin.");
        }
        
        user.setStatus(status);
        userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new RuntimeException("Access Denied: Cannot delete a Super Admin.");
        }
        userRepository.delete(user);
    }
}
