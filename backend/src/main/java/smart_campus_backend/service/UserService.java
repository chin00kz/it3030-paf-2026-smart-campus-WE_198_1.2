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

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        // In a real app, you'd encrypt the password here
        // For now, we'll store it as is since we're just setting up the platform
        return userRepository.save(user);
    }
}
