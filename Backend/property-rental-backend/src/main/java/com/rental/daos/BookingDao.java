package com.rental.daos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.entity.Booking;
import com.rental.entity.User;

public interface BookingDao extends JpaRepository<Booking, Long> {

    List<Booking> findByTenantUserId(Long userId);

    boolean existsByPropertyPropertyIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long propertyId,
            LocalDate endDate,
            LocalDate startDate
    );

    List<Booking> findByPropertyPropertyId(Long propertyId);
    
    List<Booking> findByPropertyOwner(User owner);
}