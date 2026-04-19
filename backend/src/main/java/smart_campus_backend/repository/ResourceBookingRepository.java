package smart_campus_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smart_campus_backend.model.ResourceBooking;
import smart_campus_backend.model.BookingStatus;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ResourceBookingRepository extends JpaRepository<ResourceBooking, Long> {

    List<ResourceBooking> findByResourceIdOrderByCreatedAtDesc(Long resourceId);

    List<ResourceBooking> findByBookedByEmailOrderByCreatedAtDesc(String email);

    List<ResourceBooking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<ResourceBooking> findAllByOrderByCreatedAtDesc();

    boolean existsByResourceIdAndBookingDateAndStatus(Long resourceId, LocalDate bookingDate, BookingStatus status);
}
