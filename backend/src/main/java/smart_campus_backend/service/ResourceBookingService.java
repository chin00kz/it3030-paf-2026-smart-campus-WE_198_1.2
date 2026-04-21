package smart_campus_backend.service;

import org.springframework.stereotype.Service;
import smart_campus_backend.dto.ResourceBookingDTO;
import smart_campus_backend.exception.ResourceNotFoundException;
import smart_campus_backend.model.*;
import smart_campus_backend.repository.ResourceBookingRepository;
import smart_campus_backend.repository.ResourceRepository;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceBookingService {

    private final ResourceBookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public ResourceBookingService(ResourceBookingRepository bookingRepository,
                                  ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    @PostConstruct
    public void cleanupBookedStatuses() {
        // Migration: Convert any remaining BOOKED statuses to AVAILABLE 
        // to allow them to be booked via time-slots.
        List<Resource> bookedResources = resourceRepository.findAll().stream()
                .filter(r -> r.getStatus() == ResourceStatus.BOOKED)
                .collect(Collectors.toList());
        
        if (!bookedResources.isEmpty()) {
            bookedResources.forEach(r -> r.setStatus(ResourceStatus.AVAILABLE));
            resourceRepository.saveAll(bookedResources);
        }
    }

    public ResourceBookingDTO createBooking(ResourceBookingDTO dto) {
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + dto.getResourceId()));

        // Check for conflicting bookings on the same day with overlapping time slots
        List<ResourceBooking> existingBookings = bookingRepository.findByResourceIdAndBookingDateAndStatusIn(
                dto.getResourceId(), 
                dto.getBookingDate(), 
                List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING)
        );

        for (ResourceBooking existing : existingBookings) {
            // Overlap condition: (StartA < EndB) and (EndA > StartB)
            if (dto.getStartTime().isBefore(existing.getEndTime()) && 
                dto.getEndTime().isAfter(existing.getStartTime())) {
                
                throw new IllegalStateException(String.format(
                    "Time conflict: This resource is already booked from %s to %s on %s.",
                    existing.getStartTime(), 
                    existing.getEndTime(), 
                    dto.getBookingDate()
                ));
            }
        }

        if (dto.getBookedByName() == null || dto.getBookedByName().isBlank())
            throw new IllegalArgumentException("Booked by name is required");
        if (dto.getBookedByEmail() == null || dto.getBookedByEmail().isBlank())
            throw new IllegalArgumentException("Booked by email is required");
        if (dto.getBookingDate() == null)
            throw new IllegalArgumentException("Booking date is required");
        if (dto.getStartTime() == null || dto.getEndTime() == null)
            throw new IllegalArgumentException("Start and end time are required");
        if (!dto.getEndTime().isAfter(dto.getStartTime()))
            throw new IllegalArgumentException("End time must be after start time");

        ResourceBooking booking = new ResourceBooking();
        booking.setResource(resource);
        booking.setBookedByName(dto.getBookedByName());
        booking.setBookedByEmail(dto.getBookedByEmail());
        booking.setBookingDate(dto.getBookingDate());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        ResourceBooking savedBooking = bookingRepository.save(booking);
        
        // Note: We no longer set the resource status to BOOKED globally 
        // to allow it to be booked on other dates.

        return mapToDto(savedBooking);
    }

    public List<ResourceBookingDTO> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ResourceBookingDTO> getBookingsByEmail(String email) {
        return bookingRepository.findByBookedByEmailOrderByCreatedAtDesc(email)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ResourceBookingDTO> getBookingsByResource(Long resourceId) {
        return bookingRepository.findByResourceIdOrderByCreatedAtDesc(resourceId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ResourceBookingDTO updateBookingStatus(Long bookingId, BookingStatus newStatus, String declineReason) {
        ResourceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        booking.setStatus(newStatus);
        if (newStatus == BookingStatus.DECLINED && declineReason != null) {
            booking.setDeclineReason(declineReason);
        }
        return mapToDto(bookingRepository.save(booking));
    }

    public void cancelBooking(Long bookingId, String email) {
        ResourceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getBookedByEmail().equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private ResourceBookingDTO mapToDto(ResourceBooking b) {
        ResourceBookingDTO dto = new ResourceBookingDTO();
        dto.setId(b.getId());
        dto.setResourceId(b.getResource().getId());
        dto.setResourceName(b.getResource().getName());
        dto.setResourceLocation(b.getResource().getLocation());
        dto.setBookedByName(b.getBookedByName());
        dto.setBookedByEmail(b.getBookedByEmail());
        dto.setBookingDate(b.getBookingDate());
        dto.setStartTime(b.getStartTime());
        dto.setEndTime(b.getEndTime());
        dto.setPurpose(b.getPurpose());
        dto.setStatus(b.getStatus());
        dto.setDeclineReason(b.getDeclineReason());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setUpdatedAt(b.getUpdatedAt());
        return dto;
    }
}
