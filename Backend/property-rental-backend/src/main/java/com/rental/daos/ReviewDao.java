package com.rental.daos;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.entity.Property;
import com.rental.entity.Review;

@Repository
public interface ReviewDao extends JpaRepository<Review, Long>{
	
	List<Review> findByProperty(Property property);
}
