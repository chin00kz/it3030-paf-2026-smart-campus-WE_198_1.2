package smart_campus_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import smart_campus_backend.model.Resource;
import smart_campus_backend.model.ResourceType;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    
    @Query("SELECT r FROM Resource r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:capacity IS NULL OR r.capacity >= :capacity) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<Resource> searchResources(@Param("type") ResourceType type, 
                                   @Param("capacity") Integer capacity, 
                                   @Param("location") String location,
                                   @Param("name") String name);
}
