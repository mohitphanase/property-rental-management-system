package com.rental.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AdminUserDto {
	
	private Long userId;
	private String name;
	private String email;
	private String phone;
	private String role;
	private LocalDateTime createdAt;

}
