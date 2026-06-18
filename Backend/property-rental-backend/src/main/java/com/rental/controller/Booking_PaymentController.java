package com.rental.controller;

import java.util.List;

import com.rental.dto.BookingRequestDto;
import com.rental.dto.BookingStatusDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.rental.dto.Resp;
import com.rental.entity.Booking;
import com.rental.service.BookingService;

@RestController
@RequestMapping("/booking")
public class Booking_PaymentController {

    @Autowired
    private BookingService bookingService;



    @Autowired
    public Booking_PaymentController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Get all bookings of a tenant-user
    @GetMapping("/user/{userId}")
    public Resp<?> getUserBookings(@PathVariable Long userId) {

        return Resp.success(
                bookingService.getUserBookingDtos(userId)
        );
    }
    // Add Booking of a tenant
    @PostMapping("/add")
    public Resp<?> addBooking(@RequestBody BookingRequestDto dto) {

        Booking booking = bookingService.addBooking(dto);
        return Resp.success(booking);

    }

    // Set Booking Status
    @PutMapping("/{bookingId}/statusa")
    public Resp<?> updateBookingStatus( @PathVariable Long bookingId, @RequestBody BookingStatusDto dto) {

        Booking booking = bookingService.updateBookingStatus(bookingId, dto.getStatus());

        return Resp.success(booking);
    }


    @GetMapping("/{bookingId}")
    public Resp<?> getBooking(@PathVariable Long bookingId) {
        return Resp.success(
                bookingService.getBooking(bookingId)
        );
    }


}