package smart_campus_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
public class ResourceDTO {
    private Long id;

    @NotBlank(message = "Name is mandatory")
    private String name;

    @NotNull(message = "Type is mandatory")
    private smart_campus_backend.model.ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is mandatory")
    private String location;

    private LocalTime availabilityStartTime;
    private LocalTime availabilityEndTime;

    @NotNull(message = "Status is mandatory")
    private smart_campus_backend.model.ResourceStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
