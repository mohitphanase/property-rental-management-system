package com.rental.daos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rental.entity.Property;
import com.rental.entity.PropertyType;
import com.rental.entity.User;

public interface PropertyDao extends JpaRepository<Property, Long> {

    // Get properties by city
    List<Property> findByCity(String city);

    // Get properties by type
    List<Property> findByPropertyType(PropertyType propertyType);
    
    //Get Properties by city and type
    List<Property> findByCityAndPropertyType( String city, PropertyType propertyType);

    // Get all properties of a specific owner
    List<Property> findByOwnerUserId(Long ownerId);
    
    List<Property> findByOwner(User owner);
}

