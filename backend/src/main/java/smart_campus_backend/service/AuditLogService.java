package smart_campus_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import smart_campus_backend.model.AuditAction;
import smart_campus_backend.model.AuditLog;
import smart_campus_backend.repository.AuditLogRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(AuditAction action, String adminName, String adminEmail, String targetId, String details) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .adminName(adminName)
                .adminEmail(adminEmail)
                .targetId(targetId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
