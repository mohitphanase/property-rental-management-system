package com.rental.dto;

import lombok.Data;

@Data
public class RegisterRequestDto {
	
	 private String name;
	 private String email;
	 private String phone;
	 private String password;
	 private String role;

}
