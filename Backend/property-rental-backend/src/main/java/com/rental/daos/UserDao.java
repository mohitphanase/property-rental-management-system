package com.rental.daos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.entity.User;

public interface UserDao extends JpaRepository<User, Long> {
	
	Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

}
