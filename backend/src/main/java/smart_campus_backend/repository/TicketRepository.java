package smart_campus_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smart_campus_backend.model.Ticket;
import smart_campus_backend.model.TicketStatus;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findAllByOrderByCreatedAtDesc();

    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    List<Ticket> findByReportedByEmailOrderByCreatedAtDesc(String email);

    List<Ticket> findByTechnicianEmailOrderByCreatedAtDesc(String email);

    List<Ticket> findByResourceIdAndStatusIn(Long resourceId, List<TicketStatus> statuses);
}
