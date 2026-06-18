package com.rental.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "reviews",uniqueConstraints = {
		@UniqueConstraint(columnNames = {"property_id","tenant_id"})
})

public class Review {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "review_id")
	private Long reviewId;
	
	@ManyToOne
	@JoinColumn(name = "property_id")
	private Property property;
	
	@ManyToOne
	@JoinColumn(name = "tenant_id")
	private User tenant;
	
	private Integer rating;
	
	@Column(columnDefinition = "TEXT")
	private String comment;
	
	@Column(name = "created_at")
	private LocalDateTime createAt;

}
