package com.rental.daos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.entity.Property;
import com.rental.entity.PropertyImage;

public interface PropertyImageDao extends JpaRepository<PropertyImage, Long> {

    List<PropertyImage> findByProperty(Property property);
}