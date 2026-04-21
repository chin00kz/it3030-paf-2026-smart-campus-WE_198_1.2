package smart_campus_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceInsightsDTO {
    private long totalResources;
    private Map<String, Long> resourcesByType;
    
    // Status distribution
    private long activeCount;
    private long outOfServiceCount;
    
    // Location distribution
    private Map<String, Long> buildingDistribution;
    
    // Capacity analysis
    private CapacityAnalysis capacityAnalysis;
    
    // List of out-of-service resources
    private List<UnavailableResourceDTO> outOfServiceList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CapacityAnalysis {
        private long small;  // 0-50
        private long medium; // 50-150
        private long large;  // 150+
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnavailableResourceDTO {
        private String name;
        private String location;
        private String type;
    }
}
