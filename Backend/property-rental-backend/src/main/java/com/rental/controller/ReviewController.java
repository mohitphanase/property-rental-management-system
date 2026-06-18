package com.rental.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.dto.ReviewDto;
import com.rental.entity.Review;
import com.rental.service.ReviewService;

@RestController
@RequestMapping("/reviews")
@CrossOrigin("*")
public class ReviewController {

	@Autowired
	private ReviewService reviewService;
	
	@PostMapping
	public Review addReview(
			@RequestBody ReviewDto dto) {
		return reviewService.addReview(dto);
	}
	
	@GetMapping("/{propertyId}")
	public List<Review> getReviews(
			@PathVariable Long propertyId){
		return reviewService.getReviews(propertyId);
	}
}
