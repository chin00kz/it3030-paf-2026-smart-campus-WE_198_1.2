package smart_campus_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import smart_campus_backend.dto.TicketAssignRequest;
import smart_campus_backend.dto.TicketCommentRequest;
import smart_campus_backend.dto.TicketCreateRequest;
import smart_campus_backend.dto.TicketResponse;
import smart_campus_backend.dto.TicketStatusUpdateRequest;
import smart_campus_backend.model.TicketStatus;
import smart_campus_backend.service.TicketService;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> createTicket(@Valid @ModelAttribute TicketCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) String reportedByEmail,
            @RequestParam(required = false) String technicianEmail
    ) {
        return ResponseEntity.ok(ticketService.getTickets(status, reportedByEmail, technicianEmail));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(@PathVariable Long id, @Valid @RequestBody TicketAssignRequest request) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketResponse> addComment(@PathVariable Long id, @Valid @RequestBody TicketCommentRequest request) {
        return ResponseEntity.ok(ticketService.addComment(id, request));
    }

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<TicketResponse> updateComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @Valid @RequestBody TicketCommentRequest request
    ) {
        return ResponseEntity.ok(ticketService.updateComment(id, commentId, request));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<TicketResponse> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @RequestParam String actorEmail
    ) {
        return ResponseEntity.ok(ticketService.deleteComment(id, commentId, actorEmail));
    }
}
