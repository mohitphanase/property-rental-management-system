package com.rental.service;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
		
		User user = userDao.findById(dto.getUserId()).orElseThrow();
		
		Property property = propertyDao.findById(dto.getUserId()).orElseThrow();
		
		Wishlist wishlist = new Wishlist();
		wishlist.setUser(user);
		wishlist.setProperty(property);
		
		return wishlistDao.save(wishlist);
		
	}
	
	public List<Wishlist> getWishlist(Long userId){
		
		User user = userDao.findById(userId).orElseThrow();
		
		return wishlistDao.findByUser(user);
	}
	
	public void deleteWishlist(Long wishlistId) {
		wishlistDao.deleteById(wishlistId);
	}

}
