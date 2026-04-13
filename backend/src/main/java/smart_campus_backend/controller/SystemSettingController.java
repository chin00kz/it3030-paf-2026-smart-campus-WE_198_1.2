package smart_campus_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smart_campus_backend.service.SystemSettingService;
import smart_campus_backend.service.AuditLogService;
import smart_campus_backend.model.AuditAction;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService settingService;
    private final AuditLogService auditLogService;

    @GetMapping("/maintenance")
    public ResponseEntity<?> getMaintenanceMode() {
        return ResponseEntity.ok(Map.of("enabled", settingService.isMaintenanceMode()));
    }

    @PostMapping("/maintenance")
    public ResponseEntity<?> setMaintenanceMode(@RequestBody Map<String, Boolean> request, 
                                               @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail,
                                               @RequestHeader(value = "X-Admin-Name", required = false) String adminName) {
        boolean enabled = request.getOrDefault("enabled", false);
        settingService.setMaintenanceMode(enabled);
        
        // Log the action if admin info is provided
        if (adminEmail != null) {
            auditLogService.log(
                AuditAction.SETTINGS_UPDATE,
                adminName != null ? adminName : "Admin",
                adminEmail,
                "SYSTEM",
                "Maintenance mode toggled to: " + (enabled ? "ON" : "OFF")
            );
        }

        return ResponseEntity.ok(Map.of("enabled", enabled));
    }
}
