package com.rental.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.rental.daos.UserDao;
import com.rental.entity.User;

@Service
public class CustomUserDetailsService implements UserDetailsService {
	
	private UserDao userDao;

	@Autowired
	public CustomUserDetailsService(UserDao userDao) {
		this.userDao = userDao;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		
		User user = userDao.findByEmail(email);

		if(user == null)
		    throw new UsernameNotFoundException("User Not Found");
		
		return org.springframework.security.core.userdetails
		        .User
		        .withUsername(user.getEmail())
		        .password(user.getPassword())
		        .authorities(user.getRole().name())
		        .build();
	}
	
	
}
