package smart_campus_backend.service;

import org.springframework.stereotype.Service;
import smart_campus_backend.repository.ResourceRepository;
import smart_campus_backend.model.Resource;
import smart_campus_backend.model.ResourceType;
import smart_campus_backend.dto.ResourceDTO;
import smart_campus_backend.exception.ResourceNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public ResourceDTO createResource(ResourceDTO dto) {
        Resource entity = mapToEntity(dto);
        return mapToDto(resourceRepository.save(entity));
    }

    public List<ResourceDTO> getResources(String type, Integer capacity, String location, String name) {
        ResourceType rt = null;
        if (type != null && !type.trim().isEmpty()) {
            try {
                rt = ResourceType.valueOf(type);
            } catch (IllegalArgumentException e) {
                // Ignore invalid type for filtering or handle appropriately
            }
        }
        return resourceRepository.searchResources(rt, capacity, location, name)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ResourceDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToDto(resource);
    }

    public ResourceDTO updateResource(Long id, ResourceDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setAvailabilityStartTime(dto.getAvailabilityStartTime());
        resource.setAvailabilityEndTime(dto.getAvailabilityEndTime());
        resource.setStatus(dto.getStatus());
        return mapToDto(resourceRepository.save(resource));
    }

    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resourceRepository.delete(resource);
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
        return entity;
    }
}
