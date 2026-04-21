package smart_campus_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bulk_upload_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String batchId;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private Integer resourceCount;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadTimestamp;
}
