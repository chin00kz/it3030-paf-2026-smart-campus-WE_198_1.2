package smart_campus_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import smart_campus_backend.dto.ResourceDTO;
import smart_campus_backend.exception.ResourceNotFoundException;
import smart_campus_backend.model.ResourceStatus;
import smart_campus_backend.model.ResourceType;
import smart_campus_backend.service.ResourceService;
import smart_campus_backend.service.SystemSettingService;

import java.time.LocalTime;
import java.util.Arrays;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ResourceController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ResourceController Tests")
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ResourceService resourceService;

    @MockitoBean
    private SystemSettingService systemSettingService;

    @Autowired
    private ObjectMapper objectMapper;

    private ResourceDTO resourceDTO;

    @BeforeEach
    void setUp() {
        resourceDTO = new ResourceDTO();
        resourceDTO.setId(1L);
        resourceDTO.setName("Test Lab");
        resourceDTO.setType(ResourceType.LAB);
        resourceDTO.setCapacity(30);
        resourceDTO.setLocation("Building A");
        resourceDTO.setAvailabilityStartTime(LocalTime.of(8, 0));
        resourceDTO.setAvailabilityEndTime(LocalTime.of(18, 0));
        resourceDTO.setStatus(ResourceStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Should create resource successfully")
    void testCreateResource() throws Exception {
        when(resourceService.createResource(any(ResourceDTO.class))).thenReturn(resourceDTO);

        mockMvc.perform(post("/api/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resourceDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Lab")));

        verify(resourceService, times(1)).createResource(any(ResourceDTO.class));
    }

    @Test
    @DisplayName("Should return 400 when creating resource with blank name")
    void testCreateResourceWithBlankName() throws Exception {
        resourceDTO.setName("");

        mockMvc.perform(post("/api/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resourceDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when creating resource with invalid capacity")
    void testCreateResourceWithInvalidCapacity() throws Exception {
        resourceDTO.setCapacity(0);

        mockMvc.perform(post("/api/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resourceDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should get all resources with pagination")
    void testGetResources() throws Exception {
        var page = new PageImpl<>(Arrays.asList(resourceDTO));
        when(resourceService.getResources(any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(page);

        mockMvc.perform(get("/api/resources")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Test Lab")));

        verify(resourceService, times(1)).getResources(any(), any(), any(), any(), any(), anyInt(), anyInt());
    }

    @Test
    @DisplayName("Should get resource by ID successfully")
    void testGetResourceById() throws Exception {
        when(resourceService.getResourceById(1L)).thenReturn(resourceDTO);

        mockMvc.perform(get("/api/resources/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Test Lab")));

        verify(resourceService, times(1)).getResourceById(1L);
    }

    @Test
    @DisplayName("Should return 404 when resource not found")
    void testGetResourceByIdNotFound() throws Exception {
        when(resourceService.getResourceById(999L))
                .thenThrow(new ResourceNotFoundException("Resource not found"));

        mockMvc.perform(get("/api/resources/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should update resource successfully")
    void testUpdateResource() throws Exception {
        when(resourceService.updateResource(eq(1L), any(ResourceDTO.class))).thenReturn(resourceDTO);

        mockMvc.perform(put("/api/resources/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resourceDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));

        verify(resourceService, times(1)).updateResource(eq(1L), any(ResourceDTO.class));
    }

    @Test
    @DisplayName("Should delete resource successfully")
    void testDeleteResource() throws Exception {
        doNothing().when(resourceService).deleteResource(1L);

        mockMvc.perform(delete("/api/resources/1"))
                .andExpect(status().isNoContent());

        verify(resourceService, times(1)).deleteResource(1L);
    }

    @Test
    @DisplayName("Should return 404 when deleting non-existent resource")
    void testDeleteResourceNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Resource not found"))
                .when(resourceService).deleteResource(999L);

        mockMvc.perform(delete("/api/resources/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should filter resources by type")
    void testGetResourcesByType() throws Exception {
        var page = new PageImpl<>(Arrays.asList(resourceDTO));
        when(resourceService.getResources(eq("LAB"), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(page);

        mockMvc.perform(get("/api/resources")
                .param("type", "LAB")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        verify(resourceService, times(1)).getResources(eq("LAB"), any(), any(), any(), any(), anyInt(), anyInt());
    }

    @Test
    @DisplayName("Should filter resources by capacity")
    void testGetResourcesByCapacity() throws Exception {
        var page = new PageImpl<>(Arrays.asList(resourceDTO));
        when(resourceService.getResources(any(), eq(30), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(page);

        mockMvc.perform(get("/api/resources")
                .param("capacity", "30")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk());

        verify(resourceService, times(1)).getResources(any(), eq(30), any(), any(), any(), anyInt(), anyInt());
    }

    @Test
    @DisplayName("Should filter resources by location")
    void testGetResourcesByLocation() throws Exception {
        var page = new PageImpl<>(Arrays.asList(resourceDTO));
        when(resourceService.getResources(any(), any(), eq("Building A"), any(), any(), anyInt(), anyInt()))
                .thenReturn(page);

        mockMvc.perform(get("/api/resources")
                .param("location", "Building A")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk());

        verify(resourceService, times(1)).getResources(any(), any(), eq("Building A"), any(), any(), anyInt(), anyInt());
    }

    @Test
    @DisplayName("Should handle invalid filter type")
    void testGetResourcesWithInvalidType() throws Exception {
        when(resourceService.getResources(eq("INVALID"), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenThrow(new IllegalArgumentException("Invalid resource type"));

        mockMvc.perform(get("/api/resources")
                .param("type", "INVALID")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isBadRequest());
    }
}
