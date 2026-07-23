package com.rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminTopPropertyDto {

	
	private Long propertyId;
    private String title;
    private Long totalBookings;
}
