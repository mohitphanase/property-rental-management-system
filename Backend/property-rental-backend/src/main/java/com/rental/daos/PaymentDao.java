package com.rental.daos;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.rental.entity.Booking;
import com.rental.entity.Payment;
import com.rental.entity.PaymentStatus;

public interface PaymentDao extends JpaRepository<Payment, Long> {

    // Check payment by booking
    Optional<Payment> findByBooking(Booking booking);

    // Total revenue
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = 'SUCCESS'")
    BigDecimal getTotalRevenue();

    // Revenue grouped by month
    @Query("SELECT FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m'), SUM(p.amount) " +
           "FROM Payment p " +
           "WHERE p.paymentStatus = 'SUCCESS' " +
           "GROUP BY FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m') " +
           "ORDER BY FUNCTION('DATE_FORMAT', p.paymentDate, '%Y-%m')")
    List<Object[]> getRevenueGroupedByMonth();

    long countByPaymentStatus(PaymentStatus paymentStatus);
}