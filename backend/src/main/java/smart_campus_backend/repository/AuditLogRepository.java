package smart_campus_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import smart_campus_backend.model.AuditLog;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByTimestampDesc();
    
    @Query("SELECT DATE(a.timestamp), COUNT(a) FROM AuditLog a WHERE a.timestamp >= :startDate GROUP BY DATE(a.timestamp)")
    List<Object[]> countByDateAfter(@Param("startDate") LocalDateTime startDate);
}
