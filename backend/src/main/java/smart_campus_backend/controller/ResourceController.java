package smart_campus_backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smart_campus_backend.dto.ResourceDTO;
import smart_campus_backend.service.ResourceService;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    /**
     * Create a new resource
     * @param resourceDTO Resource data
     * @return Created resource with 201 status
     */
    @PostMapping
    public ResponseEntity<?> createResource(@Valid @RequestBody ResourceDTO resourceDTO) {
        try {
            return new ResponseEntity<>(resourceService.createResource(resourceDTO), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                new ErrorResponse("Validation Error", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Bulk create resources
     * @param resourceDTOs List of resource data
     * @return Created resources with 201 status
     */
    @PostMapping("/bulk")
    public ResponseEntity<?> createResources(@Valid @RequestBody List<ResourceDTO> resourceDTOs) {
        try {
            return new ResponseEntity<>(resourceService.createResources(resourceDTOs), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                new ErrorResponse("Validation Error", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Internal Error", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get all resources with pagination and filtering
     * @param type Resource type filter (optional)
     * @param capacity Minimum capacity filter (optional)
     * @param location Location filter (optional)
     * @param name Name filter (optional)
     * @param status Status filter (optional)
     * @param page Page number (default: 0)
     * @param size Page size (default: 10, max: 100)
     * @return Paginated list of resources
     */
    @GetMapping
    public ResponseEntity<?> getResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<ResourceDTO> resources = resourceService.getResources(type, capacity, location, name, status, page, size);
            return ResponseEntity.ok(resources);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                new ErrorResponse("Invalid Filter", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Get a resource by ID
     * @param id Resource ID
     * @return Resource details
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(resourceService.getResourceById(id));
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                new ErrorResponse("Validation Error", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Not Found", e.getMessage()),
                HttpStatus.NOT_FOUND
            );
        }
    }

    /**
     * Update a resource
     * @param id Resource ID
     * @param resourceDTO Updated resource data
     * @return Updated resource
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateResource(@PathVariable Long id, @Valid @RequestBody ResourceDTO resourceDTO) {
        try {
            return ResponseEntity.ok(resourceService.updateResource(id, resourceDTO));
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                new ErrorResponse("Validation Error", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Not Found", e.getMessage()),
                HttpStatus.NOT_FOUND
            );
        }
    }

    /**
     * Delete a resource
     * @param id Resource ID
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        try {
            resourceService.deleteResource(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                new ErrorResponse("Validation Error", e.getMessage()),
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Not Found", e.getMessage()),
                HttpStatus.NOT_FOUND
            );
        }
    }

    /**
     * Get resource insights
     * @return Resource insights data
     */
    @GetMapping("/insights")
    public ResponseEntity<?> getResourceInsights() {
        try {
            return ResponseEntity.ok(resourceService.getInsights());
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Internal Error", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get bulk upload history
     * @return List of bulk upload records
     */
    @GetMapping("/bulk/history")
    public ResponseEntity<?> getBulkUploadHistory() {
        try {
            return ResponseEntity.ok(resourceService.getBulkUploadHistory());
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Internal Error", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Delete a bulk upload batch
     * @param batchId Unique identifier for the batch
     * @return 204 No Content
     */
    @DeleteMapping("/bulk/{batchId}")
    public ResponseEntity<?> deleteBulkUploadBatch(@PathVariable String batchId) {
        try {
            resourceService.deleteBulkUploadBatch(batchId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return new ResponseEntity<>(
                new ErrorResponse("Error deleting batch", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Inner class for error responses
     */
    public static class ErrorResponse {
        private final String error;
        private final String message;
        private final long timestamp;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}