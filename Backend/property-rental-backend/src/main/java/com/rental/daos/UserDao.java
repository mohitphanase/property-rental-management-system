package com.rental.daos;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.entity.Role;
import com.rental.entity.User;

public interface UserDao extends JpaRepository<User, Long> {
	
	User findByEmail(String email);

    boolean existsByEmail(String email);
    
    
    // Admin: count users by role (ADMIN / OWNER / TENANT)
    long countByRole(Role role);
    
//  Admin: users created after a given date(used for "new users this week")
    long countByCreatedAtAfter(LocalDateTime since);
    
//  Admin: list users filtered by role
    List<User> findByRole(Role role);

}
