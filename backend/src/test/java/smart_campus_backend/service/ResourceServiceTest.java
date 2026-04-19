package smart_campus_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import smart_campus_backend.dto.ResourceDTO;
import smart_campus_backend.exception.ResourceNotFoundException;
import smart_campus_backend.model.Resource;
import smart_campus_backend.model.ResourceStatus;
import smart_campus_backend.model.ResourceType;
import smart_campus_backend.repository.ResourceRepository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResourceService Tests")
public class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource resource;
    private ResourceDTO resourceDTO;

    @BeforeEach
    void setUp() {
        resource = new Resource();
        resource.setId(1L);
        resource.setName("Test Lab");
        resource.setType(ResourceType.LAB);
        resource.setCapacity(30);
        resource.setLocation("Building A");
        resource.setAvailabilityStartTime(LocalTime.of(8, 0));
        resource.setAvailabilityEndTime(LocalTime.of(18, 0));
        resource.setStatus(ResourceStatus.ACTIVE);
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());

        resourceDTO = new ResourceDTO();
        resourceDTO.setName("Test Lab");
        resourceDTO.setType(ResourceType.LAB);
        resourceDTO.setCapacity(30);
        resourceDTO.setLocation("Building A");
        resourceDTO.setAvailabilityStartTime(LocalTime.of(8, 0));
        resourceDTO.setAvailabilityEndTime(LocalTime.of(18, 0));
        resourceDTO.setStatus(ResourceStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should create resource successfully")
    void testCreateResource() {
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);
        ResourceDTO stored = resourceService.createResource(resourceDTO);
        assertNotNull(stored);
        assertEquals("Test Lab", stored.getName());
        assertEquals(ResourceType.LAB, stored.getType());
    }

    @Test
    @DisplayName("Should throw exception when creating resource with null DTO")
    void testCreateResourceWithNullDTO() {
        assertThrows(IllegalArgumentException.class, () -> resourceService.createResource(null));
    }

    @Test
    @DisplayName("Should throw exception when creating resource with blank name")
    void testCreateResourceWithBlankName() {
        resourceDTO.setName("");
        assertThrows(IllegalArgumentException.class, () -> resourceService.createResource(resourceDTO));
    }

    @Test
    @DisplayName("Should throw exception when creating resource with invalid capacity")
    void testCreateResourceWithInvalidCapacity() {
        resourceDTO.setCapacity(0);
        assertThrows(IllegalArgumentException.class, () -> resourceService.createResource(resourceDTO));
    }

    @Test
    @DisplayName("Should throw exception when creating resource with name exceeding max length")
    void testCreateResourceWithNameTooLong() {
        resourceDTO.setName("A".repeat(256));
        assertThrows(IllegalArgumentException.class, () -> resourceService.createResource(resourceDTO));
    }

    @Test
    @DisplayName("Should get resource by ID successfully")
    void testGetResourceById_Success() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        ResourceDTO found = resourceService.getResourceById(1L);
        assertNotNull(found);
        assertEquals("Test Lab", found.getName());
        assertEquals(30, found.getCapacity());
    }

    @Test
    @DisplayName("Should throw exception when resource not found by ID")
    void testGetResourceById_NotFound() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> resourceService.getResourceById(1L));
    }

    @Test
    @DisplayName("Should throw exception for invalid resource ID")
    void testGetResourceById_InvalidId() {
        assertThrows(IllegalArgumentException.class, () -> resourceService.getResourceById(-1L));
        assertThrows(IllegalArgumentException.class, () -> resourceService.getResourceById(null));
    }

    @Test
    @DisplayName("Should update resource successfully")
    void testUpdateResource() {
        ResourceDTO updateDTO = new ResourceDTO();
        updateDTO.setName("Updated Lab");
        updateDTO.setType(ResourceType.LAB);
        updateDTO.setCapacity(50);
        updateDTO.setLocation("Building B");
        updateDTO.setStatus(ResourceStatus.ACTIVE);

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        ResourceDTO updated = resourceService.updateResource(1L, updateDTO);
        assertNotNull(updated);
        verify(resourceRepository, times(1)).findById(1L);
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent resource")
    void testUpdateResource_NotFound() {
        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> resourceService.updateResource(999L, resourceDTO));
    }

    @Test
    @DisplayName("Should delete resource successfully")
    void testDeleteResource() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        doNothing().when(resourceRepository).delete(resource);
        
        assertDoesNotThrow(() -> resourceService.deleteResource(1L));
        verify(resourceRepository, times(1)).delete(resource);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent resource")
    void testDeleteResource_NotFound() {
        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> resourceService.deleteResource(999L));
    }

    @Test
    @DisplayName("Should get resources with pagination")
    void testGetResourcesWithPagination() {
        Resource resource2 = new Resource();
        resource2.setId(2L);
        resource2.setName("Test Hall");
        resource2.setType(ResourceType.LECTURE_HALL);
        resource2.setCapacity(100);
        resource2.setLocation("Building B");
        resource2.setStatus(ResourceStatus.ACTIVE);

        Page<Resource> page = new PageImpl<>(Arrays.asList(resource, resource2));
        when(resourceRepository.searchResources(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        Page<ResourceDTO> result = resourceService.getResources(null, null, null, null, null, 0, 10);
        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        verify(resourceRepository, times(1)).searchResources(any(), any(), any(), any(), any(), any(Pageable.class));
    }

    @Test
    @DisplayName("Should handle invalid resource type")
    void testGetResources_InvalidType() {
        assertThrows(IllegalArgumentException.class, () -> 
            resourceService.getResources("INVALID_TYPE", null, null, null, null, 0, 10)
        );
    }

    @Test
    @DisplayName("Should handle invalid resource status")
    void testGetResources_InvalidStatus() {
        assertThrows(IllegalArgumentException.class, () -> 
            resourceService.getResources(null, null, null, null, "INVALID_STATUS", 0, 10)
        );
    }

    @Test
    @DisplayName("Should normalize page size to max allowed")
    void testGetResources_PageSizeNormalization() {
        Page<Resource> page = new PageImpl<>(Arrays.asList(resource));
        when(resourceRepository.searchResources(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        Page<ResourceDTO> result = resourceService.getResources(null, null, null, null, null, 0, 200);
        assertNotNull(result);
        verify(resourceRepository, times(1)).searchResources(any(), any(), any(), any(), any(), 
            argThat(p -> p.getPageSize() <= 100));
    }

    @Test
    @DisplayName("Should get resources by status")
    void testGetResourcesByStatus() {
        when(resourceRepository.findByStatus(ResourceStatus.ACTIVE))
                .thenReturn(Arrays.asList(resource));

        var result = resourceService.getResourcesByStatus(ResourceStatus.ACTIVE);
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(resourceRepository, times(1)).findByStatus(ResourceStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should get resources by type")
    void testGetResourcesByType() {
        when(resourceRepository.findByType(ResourceType.LAB))
                .thenReturn(Arrays.asList(resource));

        var result = resourceService.getResourcesByType(ResourceType.LAB);
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(resourceRepository, times(1)).findByType(ResourceType.LAB);
    }
}
