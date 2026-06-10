package com.rental.service;

import java.time.LocalDateTime;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rental.daos.UserDao;
import com.rental.dto.RegisterRequestDto;
import com.rental.entity.User;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class UserServiceImpl {
	private UserDao userDao;
	private ModelMapper modelMapper;
	
	@Autowired
	public UserServiceImpl(UserDao userDao, ModelMapper modelMapper) {
		super();
		this.userDao = userDao;
		this.modelMapper = modelMapper;
	}
	
	public RegisterRequestDto register(RegisterRequestDto registerRequestDto) {

        if(userDao.existsByEmail(registerRequestDto.getEmail()))
            throw new RuntimeException("Email already exists");

        User user = modelMapper.map(registerRequestDto, User.class);
        user.setCreatedAt(LocalDateTime.now());
        user = userDao.save(user);

        return modelMapper.map(user, RegisterRequestDto.class);
    }
	
}
