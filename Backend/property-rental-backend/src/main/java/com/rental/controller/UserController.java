package com.rental.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.dto.LoginRequestDto;
import com.rental.dto.RegisterRequestDto;
import com.rental.dto.Resp;
import com.rental.service.UserServiceImpl;
import com.rental.dto.LoginResponseDto;

@RestController
@RequestMapping("/user")
public class UserController {
	private UserServiceImpl userService;
	
	@Autowired
	public UserController(UserServiceImpl userService) {
		this.userService = userService;
	}
	
	//Registration
	@PostMapping("/register")
	public Resp<?> registerUser(@RequestBody RegisterRequestDto registerRequestDto) {
		registerRequestDto = userService.register(registerRequestDto);
		return Resp.success(registerRequestDto);
	}
	
	//Login
	@PostMapping("/login")
	public Resp<?> login(@RequestBody LoginRequestDto loginRequestDto) {

	    return Resp.success(userService.login(loginRequestDto));
	}

	
}
