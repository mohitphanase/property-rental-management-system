package com.rental.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rental.daos.PropertyDao;
import com.rental.daos.ReviewDao;
import com.rental.daos.UserDao;
import com.rental.dto.ReviewDto;
import com.rental.entity.Property;
import com.rental.entity.Review;
import com.rental.entity.User;

@Service
public class ReviewService {
	
	@Autowired
	private ReviewDao reviewDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private PropertyDao propertyDao;
	
	public Review addReview(ReviewDto dto) {
		
		User tenant = userDao.findById(dto.getTenant_Id()).orElseThrow();
		
		Property property = propertyDao.findById(dto.getProperty_Id()).orElseThrow();
		
		Review review = new Review();
		
		review.setTenant(tenant);
		review.setProperty(property);
		review.setRating(dto.getRating());
		review.setComment(dto.getComment());
		review.setCreateAt(LocalDateTime.now());
		
		return reviewDao.save(review);
	}
	
	public List<Review> getReviews(Long propertyId){
		
		Property property =propertyDao.findById(propertyId).orElseThrow();
		
		return reviewDao.findByProperty(property);
	}

}
