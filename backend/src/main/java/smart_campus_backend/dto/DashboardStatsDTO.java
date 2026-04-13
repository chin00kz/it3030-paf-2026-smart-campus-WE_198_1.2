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
public class DashboardStatsDTO {
    private long totalUsers;
    private long activeAdmins;
    private long pendingUsers;
    private long bannedUsers;
    private List<DailyActivity> activityData;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyActivity {
        private String day;
        private long count;
    }
}
