package com.rental.daos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.entity.User;
import com.rental.entity.Wishlist;
import java.util.List;


@Repository
public interface WishlistDao extends JpaRepository<Wishlist, Long> {
	
	List<Wishlist> findByUser(User user);

}
