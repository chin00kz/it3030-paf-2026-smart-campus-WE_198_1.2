package smart_campus_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
public class ResourceDTO {
    private Long id;

    @NotBlank(message = "Name is mandatory")
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;

    @NotNull(message = "Type is mandatory")
    private smart_campus_backend.model.ResourceType type;

    @NotNull(message = "Capacity is mandatory")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 10000, message = "Capacity cannot exceed 10000")
    private Integer capacity;

    @NotBlank(message = "Location is mandatory")
    @Size(min = 1, max = 255, message = "Location must be between 1 and 255 characters")
    private String location;

    private LocalTime availabilityStartTime;
    private LocalTime availabilityEndTime;

    @NotNull(message = "Status is mandatory")
    private smart_campus_backend.model.ResourceStatus status;

    private String availableDays;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
