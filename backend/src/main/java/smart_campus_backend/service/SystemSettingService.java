package smart_campus_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import smart_campus_backend.model.SystemSetting;
import smart_campus_backend.repository.SystemSettingRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository repository;
    private static final String MAINTENANCE_MODE_KEY = "MAINTENANCE_MODE";

    public boolean isMaintenanceMode() {
        return repository.findBySettingKey(MAINTENANCE_MODE_KEY)
                .map(setting -> "true".equalsIgnoreCase(setting.getSettingValue()))
                .orElse(false);
    }

    public void setMaintenanceMode(boolean enabled) {
        SystemSetting setting = repository.findBySettingKey(MAINTENANCE_MODE_KEY)
                .orElse(SystemSetting.builder()
                        .settingKey(MAINTENANCE_MODE_KEY)
                        .build());
        
        setting.setSettingValue(String.valueOf(enabled));
        repository.save(setting);
    }
}
