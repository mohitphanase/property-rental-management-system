package com.rental.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rental.daos.PropertyDao;
import com.rental.daos.ReviewDao;
import com.rental.daos.UserDao;
import com.rental.dto.ReviewDto;
import com.rental.entity.Property;
import com.rental.entity.Review;
import com.rental.entity.User;

@Service
@Transactional
public class ReviewService {

    @Autowired
    private ReviewDao reviewDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PropertyDao propertyDao;

    public Review addReview(ReviewDto dto) {
        if (dto.getPropertyId() == null) {
            throw new IllegalArgumentException("Property ID must not be null");
        }

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User tenant = userDao.findByEmail(email);
        if (tenant == null) {
            throw new RuntimeException("Authenticated user not found");
        }

        Property property = propertyDao
                .findById(dto.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + dto.getPropertyId()));

        Review review = new Review();
        review.setTenant(tenant);
        review.setProperty(property);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setCreateAt(LocalDateTime.now());

        return reviewDao.save(review);
    }

    @Transactional(readOnly = true)
    public List<Review> getReviews(Long propertyId) {
        Property property = propertyDao.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + propertyId));

        return reviewDao.findByProperty(property);
    }

    @Transactional(readOnly = true)
    public List<Review> getMyReviews() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User tenant = userDao.findByEmail(email);
        if (tenant == null) {
            throw new RuntimeException("Authenticated user not found");
        }

        return reviewDao.findByTenant(tenant);
    }

    public void deleteReview(Long reviewId) {
        Review review = reviewDao.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));
        reviewDao.delete(review);
    }
}