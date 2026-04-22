package smart_campus_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import smart_campus_backend.model.TicketPriority;

@Data
public class TicketCreateRequest {
    @NotNull
    private Long resourceId;

    @NotBlank
    private String reportedByEmail;

    @NotBlank
    private String category;

    @NotBlank
    private String description;

    private TicketPriority priority = TicketPriority.MEDIUM;

    private String contactDetails;

    private MultipartFile[] attachments;
}
