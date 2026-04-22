package smart_campus_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import smart_campus_backend.dto.DashboardStatsDTO;
import smart_campus_backend.model.Role;
import smart_campus_backend.model.UserStatus;
import smart_campus_backend.repository.AuditLogRepository;
import smart_campus_backend.repository.UserRepository;
import smart_campus_backend.repository.ResourceRepository;
import smart_campus_backend.model.ResourceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
public class DashboardController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final ResourceRepository resourceRepository;

    @GetMapping("/stats")
    public DashboardStatsDTO getStats() {
        long totalUsers = userRepository.count();
        long activeAdmins = userRepository.countByRole(Role.ADMIN);
        long pendingUsers = userRepository.countByStatus(UserStatus.PENDING);
        long bannedUsers = userRepository.countByStatus(UserStatus.BANNED);

        // Get activity data for the last 7 days
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(6).atStartOfDay();
        List<Object[]> queryResults = auditLogRepository.countByDateAfter(sevenDaysAgo);

        Map<LocalDate, Long> activityMap = queryResults.stream()
                .collect(Collectors.toMap(
                        result -> java.sql.Date.valueOf(result[0].toString()).toLocalDate(),
                        result -> (Long) result[1]
                ));

        List<DashboardStatsDTO.DailyActivity> activityData = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            long count = activityMap.getOrDefault(date, 0L);
            activityData.add(new DashboardStatsDTO.DailyActivity(dayName, count));
        }

        // Resource Metrics
        long totalResources = resourceRepository.count();
        long activeResources = resourceRepository.countByStatus(ResourceStatus.AVAILABLE);
        long outOfServiceResources = resourceRepository.countByStatus(ResourceStatus.UNAVAILABLE);
        
        List<Object[]> resourceTypeCounts = resourceRepository.countByType();
        Map<String, Long> resourcesByType = new HashMap<>();
        for (Object[] result : resourceTypeCounts) {
            resourcesByType.put(result[0].toString(), (Long) result[1]);
        }

        return DashboardStatsDTO.builder()
                .totalUsers(totalUsers)
                .activeAdmins(activeAdmins)
                .pendingUsers(pendingUsers)
                .bannedUsers(bannedUsers)
                .activityData(activityData)
                .totalResources(totalResources)
                .activeResources(activeResources)
                .outOfServiceResources(outOfServiceResources)
                .resourcesByType(resourcesByType)
                .build();
    }
}
