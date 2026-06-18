package com.rental.service;

import com.rental.daos.BookingDao;
import com.rental.daos.PaymentDao;
import com.rental.dto.PaymentRequestDto;
import com.rental.entity.Booking;
import com.rental.entity.Payment;
import com.rental.entity.PaymentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentDao paymentDao;

    @Autowired
    private BookingDao bookingDao;



    public Payment addPayment(PaymentRequestDto dto) {
        Booking booking = bookingDao.findById(
                dto.getBookingId()
        ).orElseThrow(() -> new RuntimeException("booking not found"));
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(dto.getAmount());
        payment.setPaymentStatus(
                PaymentStatus.SUCCESS
        );
        payment.setTransactionId(
                UUID.randomUUID().toString()
        );
        return paymentDao.save(payment);
    }
}
