package com.rental.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
	
	private long totalUsers;
    private long totalOwners;
    private long totalTenants;
    private long totalProperties;
    private long totalBookings;
    private long pendingBookings;
    private BigDecimal totalRevenue;
    private long newUsersThisWeek;

}
