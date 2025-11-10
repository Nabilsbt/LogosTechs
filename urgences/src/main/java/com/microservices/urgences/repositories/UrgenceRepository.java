package com.microservices.urgences.repositories;

import com.microservices.urgences.entities.Priority;
import com.microservices.urgences.entities.Status;
import com.microservices.urgences.entities.Urgence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UrgenceRepository extends JpaRepository<Urgence, Long> {
    
    List<Urgence> findByStatus(Status status);
    
    List<Urgence> findByPriority(Priority priority);
    
    List<Urgence> findByAssignedDoctorId(Long doctorId);
    
    @Query("SELECT u FROM Urgence u WHERE u.status = :status ORDER BY u.priority DESC, u.arrivalTime ASC")
    List<Urgence> findByStatusOrderByPriorityAndArrivalTime(@Param("status") Status status);
    
    @Query("SELECT u FROM Urgence u WHERE u.priority = :priority AND u.status = :status")
    List<Urgence> findByPriorityAndStatus(@Param("priority") Priority priority, @Param("status") Status status);
    
    @Query("SELECT u FROM Urgence u WHERE u.arrivalTime BETWEEN :startDate AND :endDate")
    List<Urgence> findByArrivalTimeBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT u FROM Urgence u WHERE u.patientName LIKE %:name%")
    List<Urgence> findByPatientNameContaining(@Param("name") String name);
    
    @Query("SELECT COUNT(u) FROM Urgence u WHERE u.status = :status")
    Long countByStatus(@Param("status") Status status);
    
    @Query("SELECT COUNT(u) FROM Urgence u WHERE u.priority = :priority AND u.status = :status")
    Long countByPriorityAndStatus(@Param("priority") Priority priority, @Param("status") Status status);
    
    @Query("SELECT u FROM Urgence u WHERE u.status IN ('WAITING', 'TRIAGED') ORDER BY u.priority DESC, u.arrivalTime ASC")
    List<Urgence> findPendingUrgencesOrderByPriority();
}
