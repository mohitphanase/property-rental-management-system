package com.rental.daos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.rental.entity.Booking;
import com.rental.entity.BookingStatus;
import com.rental.entity.User;

public interface BookingDao extends JpaRepository<Booking, Long> {

    List<Booking> findByTenantUserId(Long userId);

    boolean existsByPropertyPropertyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long propertyId,
            LocalDate endDate,
            LocalDate startDate
    );

    List<Booking> findByPropertyPropertyId(Long propertyId);

    long countByStatus(BookingStatus status);

    @Query("SELECT FUNCTION('DATE_FORMAT', b.createdAt, '%Y-%m'), COUNT(b) " +
           "FROM Booking b " +
           "GROUP BY FUNCTION('DATE_FORMAT', b.createdAt, '%Y-%m') " +
           "ORDER BY FUNCTION('DATE_FORMAT', b.createdAt, '%Y-%m')")
    List<Object[]> countBookingsGroupedByMonth();

    @Query("SELECT b.property.propertyId, b.property.title, COUNT(b) as totalBookings " +
           "FROM Booking b " +
           "GROUP BY b.property.propertyId, b.property.title " +
           "ORDER BY totalBookings DESC")
    List<Object[]> findTopPropertiesByBookingCount();

    List<Booking> findByPropertyOwner(User owner);
    
    long countByPropertyOwner(User owner);

    long countByPropertyOwnerAndStatus(User owner, BookingStatus status);
    
    @Query("""
    		SELECT COALESCE(SUM(b.property.price), 0)
    		FROM Booking b
    		WHERE b.property.owner = :owner
    		AND b.status = com.rental.entity.BookingStatus.APPROVED
    		""")
    		Double getTotalEarnings(User owner);
}