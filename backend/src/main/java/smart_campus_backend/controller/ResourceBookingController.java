package smart_campus_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smart_campus_backend.dto.ResourceBookingDTO;
import smart_campus_backend.model.BookingStatus;
import smart_campus_backend.service.ResourceBookingService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class ResourceBookingController {

    private final ResourceBookingService bookingService;

    public ResourceBookingController(ResourceBookingService bookingService) {
        this.bookingService = bookingService;
    }

    /** Student submits a booking request */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody ResourceBookingDTO dto) {
        try {
            ResourceBookingDTO created = bookingService.createBooking(dto);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Booking Failed", "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Validation Error", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        }
    }

    /** Admin: get all bookings */
    @GetMapping
    public ResponseEntity<List<ResourceBookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /** Student: get my bookings by email */
    @GetMapping("/my")
    public ResponseEntity<List<ResourceBookingDTO>> getMyBookings(@RequestParam String email) {
        return ResponseEntity.ok(bookingService.getBookingsByEmail(email));
    }

    /** Admin: get bookings for a specific resource */
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<ResourceBookingDTO>> getBookingsByResource(@PathVariable Long resourceId) {
        return ResponseEntity.ok(bookingService.getBookingsByResource(resourceId));
    }

    /** Admin: confirm or decline a booking */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            BookingStatus status = BookingStatus.valueOf(body.get("status").toUpperCase());
            String reason = body.get("declineReason");
            return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, reason));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        }
    }

    /** Student: cancel their own booking */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            bookingService.cancelBooking(id, body.get("email"));
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cancel Failed", "message", e.getMessage()));
        }
    }
}
