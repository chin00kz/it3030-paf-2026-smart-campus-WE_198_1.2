package smart_campus_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import smart_campus_backend.model.Resource;
import smart_campus_backend.model.ResourceType;
import smart_campus_backend.model.ResourceStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    
    @Query("SELECT r FROM Resource r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:capacity IS NULL OR r.capacity >= :capacity) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:status IS NULL OR r.status = :status)")
    Page<Resource> searchResources(@Param("type") ResourceType type, 
                                   @Param("capacity") Integer capacity, 
                                   @Param("location") String location,
                                   @Param("name") String name,
                                   @Param("status") ResourceStatus status,
                                   Pageable pageable);
    
    List<Resource> findByStatus(ResourceStatus status);
    
    List<Resource> findByType(ResourceType type);
    
    List<Resource> findByLocationIgnoreCase(String location);
}
