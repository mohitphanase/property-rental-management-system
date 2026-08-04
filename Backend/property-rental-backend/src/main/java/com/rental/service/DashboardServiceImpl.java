package com.rental.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rental.daos.BookingDao;
import com.rental.daos.PropertyDao;
import com.rental.daos.UserDao;
import com.rental.dto.DashboardResponseDto;
import com.rental.entity.BookingStatus;
import com.rental.entity.User;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class DashboardServiceImpl {

    private final PropertyDao propertyDao;
    private final BookingDao bookingDao;
    private final UserDao userDao;

    public DashboardServiceImpl(
            PropertyDao propertyDao,
            BookingDao bookingDao,
            UserDao userDao) {

        this.propertyDao = propertyDao;
        this.bookingDao = bookingDao;
        this.userDao = userDao;
    }

    public DashboardResponseDto getDashboardData() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User owner = userDao.findByEmail(email);

        Long totalProperties = propertyDao.countByOwner(owner);

        Long totalBookings = bookingDao.countByPropertyOwner(owner);

        Long pendingRequests = bookingDao.countByPropertyOwnerAndStatus(
                owner,
                BookingStatus.PENDING
        );

        
        Double totalEarnings = bookingDao.getTotalEarnings(owner);

        return new DashboardResponseDto(
                totalProperties,
                totalBookings,
                pendingRequests,
                totalEarnings
        );
    }
}