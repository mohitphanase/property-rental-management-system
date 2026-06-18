package com.rental.dto;

import lombok.Data;

@Data
public class ReviewDto {

	private Long property_Id;
	private Long tenant_Id;
	private Integer rating;
	private String comment;
	
	
}
