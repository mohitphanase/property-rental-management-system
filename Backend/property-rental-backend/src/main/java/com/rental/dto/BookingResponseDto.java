package com.rental.dto;

import com.rental.entity.BookingStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingResponseDto {
    private Long bookingId;

    private Long propertyId;



    private Long tenantId;


    private LocalDate startDate;
    private LocalDate endDate;
    private BookingStatus status;

    private LocalDateTime createdAt;




}
