package com.rental.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.dto.LoginRequestDto;
import com.rental.dto.RegisterRequestDto;
import com.rental.dto.Resp;
import com.rental.security.JwtUtil;
import com.rental.service.UserServiceImpl;
import com.rental.dto.LoginResponseDto;

@RestController
@RequestMapping("/user")
public class UserController {
	private UserServiceImpl userService;
	private JwtUtil jwtUtil;
	
	@Autowired
	public UserController(UserServiceImpl userService, JwtUtil jwtUtil) {
		this.userService = userService;
		this.jwtUtil = jwtUtil;
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
	
	//Validation of token
	@GetMapping("/validate")
	public Resp<?> validateToken( @RequestHeader("Token")String authHeader) {

	    String token = authHeader;

	    boolean valid = jwtUtil.validateToken(token);

	    return Resp.success(valid);
	}
	
	//Extract Email
	@GetMapping("/email")
	public Resp<?> getEmail(
	        @RequestHeader("Token") String authHeader) {

	    String token = authHeader;

	    String email = jwtUtil.extractEmail(token);

	    return Resp.success(email);
	}

	//Current User
	@GetMapping("/current-user")
	public Resp<?> currentUser() {

	    Authentication authentication =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication();

	    return Resp.success(
	            authentication.getName());
	}
	
	//Current User Role
	@GetMapping("/current-role")
	public Resp<?> currentRole() {

	    Authentication authentication =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication();

	    return Resp.success(
	            authentication.getAuthorities());
	}
	
	//Current User Profile
	@GetMapping("/profile")
	public Resp<?> getProfile() {

	    return Resp.success(
	            userService.getCurrentUserProfile());
	}
}
