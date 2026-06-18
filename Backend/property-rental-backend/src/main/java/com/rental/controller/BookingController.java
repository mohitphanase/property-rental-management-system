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
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;



    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }
    
    // Add Booking of a tenant
    @PostMapping
    public Resp<?> addBooking(@RequestBody BookingRequestDto dto) {

        Booking booking = bookingService.addBooking(dto);
        return Resp.success(booking);

    }

    // Get all bookings of a tenant-user
    @GetMapping("/user/{userId}")
    public Resp<?> getUserBookings(@PathVariable Long userId) {

        return Resp.success( bookingService.getUserBookingDtos(userId));
    }
    
    
    @GetMapping("/{bookingId}")
    public Resp<?> getBooking(@PathVariable Long bookingId) {
        return Resp.success(
                bookingService.getBooking(bookingId)
        );
    }


}