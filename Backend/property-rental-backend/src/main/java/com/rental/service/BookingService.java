package com.rental.service;

import java.time.LocalDateTime;
import java.util.List;

import com.rental.daos.PropertyDao;
import com.rental.daos.UserDao;
import com.rental.dto.BookingRequestDto;
import com.rental.dto.BookingResponseDto;
import com.rental.entity.BookingStatus;
import com.rental.entity.Property;
import com.rental.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rental.daos.BookingDao;
import com.rental.entity.Booking;

@Service
public class BookingService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private PropertyDao propertyDao;

    @Autowired
    private BookingDao bookingDao;

    public List<Booking> getBookingByUser(Long userId) {
        return bookingDao.findByTenantUserId(userId);
    }

    public Booking addBooking(BookingRequestDto dto) {

        Property property = propertyDao.findById(dto.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found"));

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User tenant = userDao.findByEmail(email);

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new RuntimeException("Start date must be before end date");
        }

        Booking booking = new Booking();
        booking.setProperty(property);
        booking.setTenant(tenant);
        booking.setStartDate(dto.getStartDate());
        booking.setEndDate(dto.getEndDate());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        return bookingDao.save(booking);
    }

    public Booking updateBookingStatus(Long bookingId,BookingStatus status) {
        Booking booking = bookingDao.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User owner = userDao.findByEmail(email);

        if (!booking.getProperty()
                .getOwner()
                .getUserId()
                .equals(owner.getUserId())) {

            throw new RuntimeException(
                    "You are not owner of this property");
        }
        booking.setStatus(status);
        return bookingDao.save(booking);
    }

    public List<Booking> getBookingByProperty(Long propertyId) {
        return bookingDao.findByPropertyPropertyId(propertyId);
    }


    public BookingResponseDto getBooking(Long bookingId) {

        Booking booking = bookingDao.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        BookingResponseDto dto = new BookingResponseDto();

        dto.setBookingId(booking.getBookingid());
        dto.setPropertyId(booking.getProperty().getPropertyId());
        dto.setTenantId(booking.getTenant().getUserId());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setStatus(booking.getStatus());
        dto.setCreatedAt(booking.getCreatedAt());

        return dto;
    }

    public List<BookingResponseDto> getUserBookingDtos() {
    	
    	String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User tenant = userDao.findByEmail(email);

        List<Booking> bookings =
                bookingDao.findByTenantUserId(
                        tenant.getUserId());

        return bookings.stream().map(booking -> {

            BookingResponseDto dto = new BookingResponseDto();

            dto.setBookingId(booking.getBookingid());
            dto.setPropertyId(booking.getProperty().getPropertyId());
            dto.setTenantId(booking.getTenant().getUserId());

            dto.setStartDate(booking.getStartDate());
            dto.setEndDate(booking.getEndDate());
            dto.setStatus(booking.getStatus());
            dto.setCreatedAt(booking.getCreatedAt());

            return dto;

        }).toList();
    }
    
//    public List<Booking> getOwnerBookings() {
//
//        String email = SecurityContextHolder
//                .getContext()
//                .getAuthentication()
//                .getName();
//
//        User owner = userDao.findByEmail(email);
//
//        return bookingDao.findByPropertyOwner(owner);
//    }
    public List<BookingResponseDto> getOwnerBookings() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User owner = userDao.findByEmail(email);

        List<Booking> bookings = bookingDao.findByPropertyOwner(owner);

        return bookings.stream().map(booking -> {

            BookingResponseDto dto = new BookingResponseDto();

            dto.setBookingId(booking.getBookingid());

            dto.setPropertyId(booking.getProperty().getPropertyId());
            dto.setPropertyTitle(booking.getProperty().getTitle());

            dto.setTenantId(booking.getTenant().getUserId());
            dto.setTenantName(booking.getTenant().getName());

            dto.setStartDate(booking.getStartDate());
            dto.setEndDate(booking.getEndDate());
            dto.setStatus(booking.getStatus());
            dto.setCreatedAt(booking.getCreatedAt());

            return dto;

        }).toList();
    }
    
    public void deleteBooking(Long bookingId) {
        Booking booking = bookingDao.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Delete only pending bookings
        if (booking.getStatus() == BookingStatus.PENDING) {
            bookingDao.delete(booking);
            return;
        }

        // Approved bookings are cancelled instead of deleted
        if (booking.getStatus() == BookingStatus.APPROVED) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingDao.save(booking);
            return;
        }

        throw new RuntimeException("This booking cannot be cancelled.");
    }
}