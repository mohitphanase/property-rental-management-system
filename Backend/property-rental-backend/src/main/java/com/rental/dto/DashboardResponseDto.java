package com.rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDto {

    private Long totalProperties;
    private Long totalBookings;
    private Long pendingRequests;
    private Double totalEarnings;
}
