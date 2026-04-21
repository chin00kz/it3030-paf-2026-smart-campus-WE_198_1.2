package smart_campus_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smart_campus_backend.model.BulkUploadRecord;
import java.util.Optional;

@Repository
public interface BulkUploadRecordRepository extends JpaRepository<BulkUploadRecord, Long> {
    Optional<BulkUploadRecord> findByBatchId(String batchId);
    void deleteByBatchId(String batchId);
}
