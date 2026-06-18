package com.rental.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.rental.daos.WishlistDao;
import com.rental.dto.WishlistDto;
import com.rental.entity.Wishlist;
import com.rental.service.WishlistService;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin("*")
public class WishlistController {


	@Autowired
	public WishlistService wishlistService;
	
	@PostMapping
	public Wishlist addWishlist(
			@RequestBody WishlistDto dto) {
		 return wishlistService.addWishlist(dto); 
	}
	
	@GetMapping("/user/{userId}")
	public List<Wishlist> getWishlist(
			@PathVariable Long userId){
		
		return wishlistService.getWishlist(userId);
	}
	
	@DeleteMapping("/{wishlistId}")
	public String deleteWishString(
			@PathVariable Long wishlistId) {
		wishlistService.deleteWishlist(wishlistId);
		
		return "Wishlist Removed Successfully";
	}
	
}
