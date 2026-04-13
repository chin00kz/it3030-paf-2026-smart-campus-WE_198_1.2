package smart_campus_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smart_campus_backend.model.SystemSetting;
import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findBySettingKey(String settingKey);
}
