package smart_campus_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import smart_campus_backend.dto.ResourceDTO;
import smart_campus_backend.exception.ResourceNotFoundException;
import smart_campus_backend.model.Resource;
import smart_campus_backend.model.ResourceStatus;
import smart_campus_backend.model.ResourceType;
import smart_campus_backend.repository.ResourceRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
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
        resource.setStatus(ResourceStatus.ACTIVE);

        resourceDTO = new ResourceDTO();
        resourceDTO.setName("Test Lab");
        resourceDTO.setType(ResourceType.LAB);
        resourceDTO.setCapacity(30);
        resourceDTO.setStatus(ResourceStatus.ACTIVE);
    }

    @Test
    void testCreateResource() {
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);
        ResourceDTO stored = resourceService.createResource(resourceDTO);
        assertNotNull(stored);
        assertEquals("Test Lab", stored.getName());
    }

    @Test
    void testGetResourceById_Success() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        ResourceDTO found = resourceService.getResourceById(1L);
        assertNotNull(found);
        assertEquals("Test Lab", found.getName());
    }

    @Test
    void testGetResourceById_NotFound() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> {
            resourceService.getResourceById(1L);
        });
    }

    @Test
    void testDeleteResource() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        doNothing().when(resourceRepository).delete(resource);
        
        assertDoesNotThrow(() -> resourceService.deleteResource(1L));
        verify(resourceRepository, times(1)).delete(resource);
    }
}
