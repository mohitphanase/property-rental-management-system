package com.rental.service;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rental.daos.PropertyDao;
import com.rental.daos.UserDao;
import com.rental.daos.WishlistDao;
import com.rental.dto.WishlistDto;
import com.rental.entity.Property;
import com.rental.entity.User;
import com.rental.entity.Wishlist;

@Service
public class WishlistService {
	
	@Autowired
	private WishlistDao wishlistDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private PropertyDao propertyDao;
	
	public Wishlist addWishlist(WishlistDto dto) {
		
		String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userDao.findByEmail(email);

        Property property = propertyDao
                .findById(dto.getPropertyId())
                .orElseThrow(() ->
                        new RuntimeException("Property not found"));
		
		Wishlist wishlist = new Wishlist();
		wishlist.setUser(user);
		wishlist.setProperty(property);
		
		return wishlistDao.save(wishlist);
		
	}
	
	public List<Wishlist> getWishlist(){
		
		  String email = SecurityContextHolder
	                .getContext()
	                .getAuthentication()
	                .getName();

	        User user = userDao.findByEmail(email);

		return wishlistDao.findByUser(user);
	}
	
	public void deleteWishlist(Long wishlistId) {

		 Wishlist wishlist = wishlistDao.findById(wishlistId)
	                .orElseThrow(() ->
	                        new RuntimeException("Wishlist not found"));

	        String email = SecurityContextHolder
	                .getContext()
	                .getAuthentication()
	                .getName();

	        User user = userDao.findByEmail(email);

	        if (!wishlist.getUser()
	                .getUserId()
	                .equals(user.getUserId())) {

	            throw new RuntimeException(
	                    "You can delete only your own wishlist items");
	        }

	        wishlistDao.delete(wishlist);
	}

}
