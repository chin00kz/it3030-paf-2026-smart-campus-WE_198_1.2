package smart_campus_backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import smart_campus_backend.dto.TicketAssignRequest;
import smart_campus_backend.dto.TicketCommentRequest;
import smart_campus_backend.dto.TicketCreateRequest;
import smart_campus_backend.dto.TicketResponse;
import smart_campus_backend.dto.TicketStatusUpdateRequest;
import smart_campus_backend.exception.ResourceNotFoundException;
import smart_campus_backend.model.Resource;
import smart_campus_backend.model.Role;
import smart_campus_backend.model.Ticket;
import smart_campus_backend.model.TicketAttachment;
import smart_campus_backend.model.TicketComment;
import smart_campus_backend.model.TicketPriority;
import smart_campus_backend.model.TicketStatus;
import smart_campus_backend.model.User;
import smart_campus_backend.repository.ResourceRepository;
import smart_campus_backend.repository.TicketCommentRepository;
import smart_campus_backend.repository.TicketRepository;
import smart_campus_backend.repository.UserRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private static final int MAX_ATTACHMENTS = 3;
    private static final long MAX_ATTACHMENT_SIZE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${ticket.attachments.base-dir:uploads/tickets}")
    private String attachmentsBaseDir;

    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));
        User reporter = findUserByEmail(request.getReportedByEmail());

        Ticket ticket = new Ticket();
        ticket.setResource(resource);
        ticket.setReportedBy(reporter);
        ticket.setCategory(request.getCategory().trim());
        ticket.setTitle(buildTitle(request.getCategory(), request.getDescription()));
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority() == null ? TicketPriority.MEDIUM : request.getPriority());
        ticket.setContactDetails(request.getContactDetails());

        Ticket savedTicket = ticketRepository.save(ticket);
        handleAttachments(savedTicket, request.getAttachments());

        return mapToResponse(ticketRepository.save(savedTicket));
    }

    public List<TicketResponse> getTickets(TicketStatus status, String reportedByEmail, String technicianEmail) {
        List<Ticket> tickets;
        if (reportedByEmail != null && !reportedByEmail.isBlank()) {
            tickets = ticketRepository.findByReportedByEmailOrderByCreatedAtDesc(reportedByEmail);
        } else if (technicianEmail != null && !technicianEmail.isBlank()) {
            tickets = ticketRepository.findByTechnicianEmailOrderByCreatedAtDesc(technicianEmail);
        } else if (status != null) {
            tickets = ticketRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            tickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        }

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public TicketResponse getTicketById(Long ticketId) {
        return mapToResponse(getTicketOrThrow(ticketId));
    }

    @Transactional
    public TicketResponse assignTechnician(Long ticketId, TicketAssignRequest request) {
        User actor = findUserByEmail(request.getActorEmail());
        ensureAdminLike(actor);

        Ticket ticket = getTicketOrThrow(ticketId);
        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + request.getTechnicianId()));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Assigned user must have TECHNICIAN role");
        }

        ticket.setTechnician(technician);
        Ticket updated = ticketRepository.save(ticket);

        notificationService.createNotification(
                technician.getId(),
                "New Ticket Assignment",
                "You have been assigned ticket #" + ticket.getId(),
                "/technician/tickets"
        );

        return mapToResponse(updated);
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId, TicketStatusUpdateRequest request) {
        Ticket ticket = getTicketOrThrow(ticketId);
        User actor = findUserByEmail(request.getActorEmail());

        validateStatusUpdatePermission(ticket, actor, request.getStatus());
        validateStatusTransition(ticket.getStatus(), request.getStatus());

        if (request.getStatus() == TicketStatus.REJECTED) {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required when rejecting a ticket");
            }
            ticket.setRejectionReason(request.getRejectionReason().trim());
        }

        if (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank()) {
            ticket.setResolutionNotes(request.getResolutionNotes().trim());
        }

        ticket.setStatus(request.getStatus());
        Ticket updated = ticketRepository.save(ticket);

        if (!ticket.getReportedBy().getId().equals(actor.getId())) {
            notificationService.createNotification(
                    ticket.getReportedBy().getId(),
                    "Ticket Status Updated",
                    "Ticket #" + ticket.getId() + " changed to " + ticket.getStatus(),
                    "/dashboard/tickets"
            );
        }

        return mapToResponse(updated);
    }

    @Transactional
    public TicketResponse addComment(Long ticketId, TicketCommentRequest request) {
        Ticket ticket = getTicketOrThrow(ticketId);
        User actor = findUserByEmail(request.getActorEmail());

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setUser(actor);
        comment.setContent(request.getContent().trim());
        ticketCommentRepository.save(comment);

        if (!ticket.getReportedBy().getId().equals(actor.getId())) {
            notificationService.createNotification(
                    ticket.getReportedBy().getId(),
                    "New Comment on Ticket",
                    "A new comment was added to ticket #" + ticket.getId(),
                    "/dashboard/tickets"
            );
        }

        if (ticket.getTechnician() != null && !ticket.getTechnician().getId().equals(actor.getId())) {
            notificationService.createNotification(
                    ticket.getTechnician().getId(),
                    "New Comment on Assigned Ticket",
                    "A new comment was added to ticket #" + ticket.getId(),
                    "/technician/tickets"
            );
        }

        return mapToResponse(getTicketOrThrow(ticketId));
    }

    @Transactional
    public TicketResponse updateComment(Long ticketId, Long commentId, TicketCommentRequest request) {
        User actor = findUserByEmail(request.getActorEmail());
        Ticket ticket = getTicketOrThrow(ticketId);

        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getTicket().getId().equals(ticket.getId())) {
            throw new IllegalArgumentException("Comment does not belong to ticket " + ticketId);
        }

        if (!canManageComment(actor, comment)) {
            throw new IllegalArgumentException("You can only edit your own comments unless you are admin");
        }

        comment.setContent(request.getContent().trim());
        ticketCommentRepository.save(comment);
        return mapToResponse(getTicketOrThrow(ticketId));
    }

    @Transactional
    public TicketResponse deleteComment(Long ticketId, Long commentId, String actorEmail) {
        User actor = findUserByEmail(actorEmail);
        Ticket ticket = getTicketOrThrow(ticketId);

        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getTicket().getId().equals(ticket.getId())) {
            throw new IllegalArgumentException("Comment does not belong to ticket " + ticketId);
        }

        if (!canManageComment(actor, comment)) {
            throw new IllegalArgumentException("You can only delete your own comments unless you are admin");
        }

        ticketCommentRepository.delete(comment);
        return mapToResponse(getTicketOrThrow(ticketId));
    }

    private void handleAttachments(Ticket ticket, MultipartFile[] attachments) {
        if (attachments == null || attachments.length == 0) {
            return;
        }

        if (attachments.length > MAX_ATTACHMENTS) {
            throw new IllegalArgumentException("A ticket can include up to " + MAX_ATTACHMENTS + " attachments");
        }

        Path ticketFolder = Paths.get(attachmentsBaseDir, String.valueOf(ticket.getId())).normalize();
        try {
            Files.createDirectories(ticketFolder);
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to prepare attachment storage", e);
        }

        for (MultipartFile file : attachments) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            if (file.getSize() > MAX_ATTACHMENT_SIZE_BYTES) {
                throw new IllegalArgumentException("Attachment exceeds 5MB limit: " + file.getOriginalFilename());
            }

            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
                throw new IllegalArgumentException("Unsupported attachment type: " + file.getOriginalFilename());
            }

            String original = file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename();
            String safeOriginal = Paths.get(original).getFileName().toString();
            String extension = "";
            int dotIndex = safeOriginal.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = safeOriginal.substring(dotIndex);
            }
            String storedName = UUID.randomUUID() + extension;

            Path targetPath = ticketFolder.resolve(storedName).normalize();
            if (!targetPath.startsWith(ticketFolder)) {
                throw new IllegalArgumentException("Invalid attachment path");
            }

            try {
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new IllegalArgumentException("Failed to store attachment: " + safeOriginal, e);
            }

            TicketAttachment attachment = new TicketAttachment();
            attachment.setTicket(ticket);
            attachment.setFileName(safeOriginal);
            attachment.setFilePath(targetPath.toString());
            attachment.setFileType(contentType);
            ticket.getAttachments().add(attachment);
        }
    }

    private void validateStatusUpdatePermission(Ticket ticket, User actor, TicketStatus nextStatus) {
        boolean isAdminLike = actor.getRole() == Role.ADMIN || actor.getRole() == Role.SUPER_ADMIN || actor.getRole() == Role.MANAGER;

        if (isAdminLike) {
            return;
        }

        if (actor.getRole() == Role.TECHNICIAN) {
            if (ticket.getTechnician() == null || !ticket.getTechnician().getId().equals(actor.getId())) {
                throw new IllegalArgumentException("Technician can only update tickets assigned to them");
            }
            if (nextStatus == TicketStatus.REJECTED || nextStatus == TicketStatus.CLOSED) {
                throw new IllegalArgumentException("Technician cannot set REJECTED or CLOSED status");
            }
            return;
        }

        boolean isReporter = ticket.getReportedBy().getId().equals(actor.getId());
        if (!isReporter || nextStatus != TicketStatus.CLOSED || ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new IllegalArgumentException("You are not allowed to perform this status update");
        }
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        if (current == next) {
            return;
        }

        boolean valid = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED;
            case RESOLVED -> next == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false;
        };

        if (!valid) {
            throw new IllegalArgumentException("Invalid status transition: " + current + " -> " + next);
        }
    }

    private boolean canManageComment(User actor, TicketComment comment) {
        return comment.getUser().getId().equals(actor.getId())
                || actor.getRole() == Role.ADMIN
                || actor.getRole() == Role.SUPER_ADMIN;
    }

    private void ensureAdminLike(User actor) {
        if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("Only admin or manager can assign a technician");
        }
    }

    private Ticket getTicketOrThrow(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        List<TicketResponse.AttachmentInfo> attachments = ticket.getAttachments()
                .stream()
                .map(a -> TicketResponse.AttachmentInfo.builder()
                        .id(a.getId())
                        .fileName(a.getFileName())
                        .filePath(a.getFilePath())
                        .fileType(a.getFileType())
                        .uploadedAt(a.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        List<TicketResponse.CommentInfo> comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .map(c -> TicketResponse.CommentInfo.builder()
                        .id(c.getId())
                        .userId(c.getUser().getId())
                        .userName(c.getUser().getName())
                        .userEmail(c.getUser().getEmail())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt())
                        .updatedAt(c.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        return TicketResponse.builder()
                .id(ticket.getId())
                .resourceId(ticket.getResource().getId())
                .resourceName(ticket.getResource().getName())
                .resourceLocation(ticket.getResource().getLocation())
                .reportedById(ticket.getReportedBy().getId())
                .reportedByName(ticket.getReportedBy().getName())
                .reportedByEmail(ticket.getReportedBy().getEmail())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .contactDetails(ticket.getContactDetails())
                .status(ticket.getStatus())
                .technicianId(ticket.getTechnician() != null ? ticket.getTechnician().getId() : null)
                .technicianName(ticket.getTechnician() != null ? ticket.getTechnician().getName() : null)
                .technicianEmail(ticket.getTechnician() != null ? ticket.getTechnician().getEmail() : null)
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .attachments(attachments)
                .comments(comments)
                .build();
    }

    private String buildTitle(String category, String description) {
        String safeCategory = category == null ? "Incident" : category.trim();
        if (safeCategory.isEmpty()) {
            safeCategory = "Incident";
        }

        String safeDescription = description == null ? "" : description.trim();
        String base = safeDescription.isEmpty() ? safeCategory : safeCategory + ": " + safeDescription;
        return base.length() > 255 ? base.substring(0, 255) : base;
    }
}
