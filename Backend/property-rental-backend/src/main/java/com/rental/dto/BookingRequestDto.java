package com.rental.dto;

import com.rental.entity.BookingStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequestDto {
    private Long propertyId;
    private Long tenantId;
    private LocalDate startDate;
    private LocalDate endDate;
}