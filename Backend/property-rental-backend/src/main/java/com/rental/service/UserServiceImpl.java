package com.rental.service;

import java.time.LocalDateTime;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rental.daos.UserDao;
import com.rental.dto.LoginRequestDto;
import com.rental.dto.LoginResponseDto;
import com.rental.dto.RegisterRequestDto;
import com.rental.entity.User;
import com.rental.security.JwtUtil;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class UserServiceImpl {
	private UserDao userDao;
	private ModelMapper modelMapper;
	private PasswordEncoder passwordEncoder;
	private JwtUtil jwtUtil;
	
	
	public UserServiceImpl(UserDao userDao, ModelMapper modelMapper,PasswordEncoder passwordEncoder,JwtUtil jwtUtil) {
		this.userDao = userDao;
		this.modelMapper = modelMapper;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
	}
	
	//Registration
	public RegisterRequestDto register(RegisterRequestDto registerRequestDto) {

        if(userDao.existsByEmail(registerRequestDto.getEmail()))
            throw new RuntimeException("Email already exists");

        User user = modelMapper.map(registerRequestDto, User.class);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user = userDao.save(user);

        return modelMapper.map(user, RegisterRequestDto.class);
    }
	
	//Login
	public LoginResponseDto login(LoginRequestDto loginRequestDto) {

	    User user =userDao.findByEmail(loginRequestDto.getEmail());

	    if(user == null)
	        throw new RuntimeException("Invalid Email");

	    if(passwordEncoder.matches(loginRequestDto.getPassword(),user.getPassword())) {

	        String token = jwtUtil.generateToken(user.getEmail());
	        return new LoginResponseDto(token);
	    }

	    throw new RuntimeException("Invalid Password");
	}
	
	
}
