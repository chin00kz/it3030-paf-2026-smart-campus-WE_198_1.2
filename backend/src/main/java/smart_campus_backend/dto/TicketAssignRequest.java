package smart_campus_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketAssignRequest {
    @NotBlank
    private String actorEmail;

    @NotNull
    private Long technicianId;
}
