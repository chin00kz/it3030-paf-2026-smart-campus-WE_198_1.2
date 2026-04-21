package smart_campus_backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import smart_campus_backend.repository.ResourceRepository;
import smart_campus_backend.model.Resource;
import smart_campus_backend.model.ResourceType;
import smart_campus_backend.model.ResourceStatus;
import smart_campus_backend.dto.ResourceDTO;
import smart_campus_backend.exception.ResourceNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public ResourceDTO createResource(ResourceDTO dto) {
        validateResourceDTO(dto);
        Resource entity = mapToEntity(dto);
        return mapToDto(resourceRepository.save(entity));
    }

    public List<ResourceDTO> createResources(List<ResourceDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            throw new IllegalArgumentException("Resource list cannot be null or empty");
        }
        
        // Validate all first to ensure "all or nothing" consistency
        dtos.forEach(this::validateResourceDTO);
        
        List<Resource> entities = dtos.stream()
                .map(this::mapToEntity)
                .collect(Collectors.toList());
        
        return resourceRepository.saveAll(entities)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Page<ResourceDTO> getResources(String type, Integer capacity, String location, String name, 
                                          String status, int page, int size) {
        // Validate pagination parameters
        int validatedPage = Math.max(0, page);
        int validatedSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        
        ResourceType rt = null;
        if (type != null && !type.trim().isEmpty()) {
            try {
                rt = ResourceType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid resource type: " + type);
            }
        }
        
        ResourceStatus rs = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                rs = ResourceStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid resource status: " + status);
            }
        }
        
        Pageable pageable = PageRequest.of(validatedPage, validatedSize, Sort.by("name").ascending());
        return resourceRepository.searchResources(rt, capacity, location, name, rs, pageable)
                .map(this::mapToDto);
    }
    
    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ResourceDTO getResourceById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid resource ID: " + id);
        }
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToDto(resource);
    }

    public ResourceDTO updateResource(Long id, ResourceDTO dto) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid resource ID: " + id);
        }
        validateResourceDTO(dto);
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setAvailabilityStartTime(dto.getAvailabilityStartTime());
        resource.setAvailabilityEndTime(dto.getAvailabilityEndTime());
        resource.setStatus(dto.getStatus());
        resource.setAvailableDays(dto.getAvailableDays());
        
        return mapToDto(resourceRepository.save(resource));
    }

    public void deleteResource(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid resource ID: " + id);
        }
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resourceRepository.delete(resource);
    }
    
    public List<ResourceDTO> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    public List<ResourceDTO> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private void validateResourceDTO(ResourceDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Resource data cannot be null");
        }
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Resource name is mandatory");
        }
        if (dto.getName().length() > 255) {
            throw new IllegalArgumentException("Resource name cannot exceed 255 characters");
        }
        if (dto.getType() == null) {
            throw new IllegalArgumentException("Resource type is mandatory");
        }
        if (dto.getLocation() == null || dto.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Resource location is mandatory");
        }
        if (dto.getLocation().length() > 255) {
            throw new IllegalArgumentException("Resource location cannot exceed 255 characters");
        }
        if (dto.getCapacity() == null || dto.getCapacity() < 1) {
            throw new IllegalArgumentException("Resource capacity must be at least 1");
        }
        if (dto.getCapacity() > 10000) {
            throw new IllegalArgumentException("Resource capacity cannot exceed 10000");
        }
        if (dto.getStatus() == null) {
            throw new IllegalArgumentException("Resource status is mandatory");
        }
    }

    private ResourceDTO mapToDto(Resource entity) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setType(entity.getType());
        dto.setCapacity(entity.getCapacity());
        dto.setLocation(entity.getLocation());
        dto.setAvailabilityStartTime(entity.getAvailabilityStartTime());
        dto.setAvailabilityEndTime(entity.getAvailabilityEndTime());
        dto.setStatus(entity.getStatus());
        dto.setAvailableDays(entity.getAvailableDays());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private Resource mapToEntity(ResourceDTO dto) {
        Resource entity = new Resource();
        entity.setName(dto.getName());
        entity.setType(dto.getType());
        entity.setCapacity(dto.getCapacity());
        entity.setLocation(dto.getLocation());
        entity.setAvailabilityStartTime(dto.getAvailabilityStartTime());
        entity.setAvailabilityEndTime(dto.getAvailabilityEndTime());
        entity.setStatus(dto.getStatus());
        entity.setAvailableDays(dto.getAvailableDays());
        return entity;
    }
}
