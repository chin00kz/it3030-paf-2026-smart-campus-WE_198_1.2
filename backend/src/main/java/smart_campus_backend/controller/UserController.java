package smart_campus_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smart_campus_backend.model.User;
import smart_campus_backend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
public class UserController {
    private final UserService userService;
    private final smart_campus_backend.service.AuditLogService auditLogService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        auditLogService.log(
            smart_campus_backend.model.AuditAction.USER_CREATE, 
            "ADMIN", "admin@smartcampus.com", 
            createdUser.getId().toString(), 
            "Created new user: " + createdUser.getEmail() + " with role " + createdUser.getRole()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updated = userService.updateUser(id, user);
        auditLogService.log(
            smart_campus_backend.model.AuditAction.USER_UPDATE, 
            "ADMIN", "admin@smartcampus.com", 
            id.toString(), 
            "Updated user profile for: " + updated.getEmail()
        );
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestParam smart_campus_backend.model.UserStatus status) {
        userService.updateStatus(id, status);
        auditLogService.log(
            smart_campus_backend.model.AuditAction.USER_STATUS_CHANGE, 
            "ADMIN", "admin@smartcampus.com", 
            id.toString(), 
            "Changed user status to: " + status
        );
        return ResponseEntity.noContent().build();
    }
}
