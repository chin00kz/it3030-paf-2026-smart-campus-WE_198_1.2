package smart_campus_backend.dto;

import lombok.Builder;
import lombok.Data;
import smart_campus_backend.model.TicketPriority;
import smart_campus_backend.model.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceLocation;
    private Long reportedById;
    private String reportedByName;
    private String reportedByEmail;
    private String category;
    private String description;
    private TicketPriority priority;
    private String contactDetails;
    private TicketStatus status;
    private Long technicianId;
    private String technicianName;
    private String technicianEmail;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AttachmentInfo> attachments;
    private List<CommentInfo> comments;

    @Data
    @Builder
    public static class AttachmentInfo {
        private Long id;
        private String fileName;
        private String filePath;
        private String fileType;
        private LocalDateTime uploadedAt;
    }

    @Data
    @Builder
    public static class CommentInfo {
        private Long id;
        private Long userId;
        private String userName;
        private String userEmail;
        private String content;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
