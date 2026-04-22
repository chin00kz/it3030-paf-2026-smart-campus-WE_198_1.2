package smart_campus_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketCommentRequest {
    @NotBlank
    private String actorEmail;

    @NotBlank
    private String content;
}
