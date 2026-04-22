package smart_campus_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import smart_campus_backend.model.TicketStatus;

@Data
public class TicketStatusUpdateRequest {
    @NotBlank
    private String actorEmail;

    @NotNull
    private TicketStatus status;

    private String resolutionNotes;
    private String rejectionReason;
}
