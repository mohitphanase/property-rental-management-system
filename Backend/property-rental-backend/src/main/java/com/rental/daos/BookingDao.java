package com.rental.daos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.rental.entity.Booking;
import com.rental.entity.BookingStatus;

public interface BookingDao extends JpaRepository<Booking, Long> {

    List<Booking> findByTenantUserId(Long userId);

    boolean existsByPropertyPropertyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long propertyId,
            LocalDate endDate,
            LocalDate startDate
    );

    List<Booking> findByPropertyPropertyId(Long propertyId);
    
    
//  Admin
    long countByStatus(BookingStatus status);
    
//  Bookings grouped by month (for LineChart) -> [month_label, count]
    @Query("SELECT FUNCTION('DATE_FORMAT', b.createdAt, '%Y-%m'), COUNT(b) " + "FROM Booking b " + "GROUP BY FUNCTION('DATE_FORMAT', b.createdAt, '%Y-%m') " +"ORDER BY FUNCTION('DATE_FORMAT', b.createdAt, '%Y-%m')")
    List<Object[]> countBookingsGroupedByMonth();
    
    
//  Top properties by number of bookings (for PieChart) -> [propertyId, title, totalBookings]
    @Query("SELECT b.property.propertyId, b.property.title, COUNT(b) as totalBookings " + "FROM Booking b " + "GROUP BY b.property.propertyId, b.property.title " + "ORDER BY totalBookings DESC")
    List<Object[]> findTopPropertiesByBookingCount();
    
}