package com.rental.service;

import com.rental.daos.BookingDao;
import com.rental.daos.PaymentDao;
import com.rental.daos.UserDao;
import com.rental.dto.PaymentRequestDto;
import com.rental.entity.Booking;
import com.rental.entity.BookingStatus;
import com.rental.entity.Payment;
import com.rental.entity.PaymentStatus;
import com.rental.entity.User;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentDao paymentDao;

    @Autowired
    private BookingDao bookingDao;
    
    @Autowired
    private UserDao userDao;



    public Payment addPayment(PaymentRequestDto dto) {
    	Booking booking = bookingDao.findById(dto.getBookingId())
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userDao.findByEmail(email);

        if (!booking.getTenant()
                .getUserId()
                .equals(user.getUserId())) {

            throw new RuntimeException(
                    "You can pay only for your own booking");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {

            throw new RuntimeException(
                    "Booking is not approved yet");
        }
        Payment payment = new Payment();

        payment.setBooking(booking);
        payment.setAmount(dto.getAmount());

        payment.setPaymentStatus(PaymentStatus.SUCCESS);

        payment.setTransactionId(UUID.randomUUID().toString());

        payment.setPaymentDate(LocalDateTime.now());

        return paymentDao.save(payment);
    }
    public Payment getPaymentByBooking(Long bookingId) {
        Booking booking = bookingDao.findById(bookingId).orElse(null);

        if (booking == null) {
            return null;
        }

        return paymentDao.findByBooking(booking).orElse(null);
    }
}
