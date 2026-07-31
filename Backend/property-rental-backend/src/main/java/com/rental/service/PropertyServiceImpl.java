package com.rental.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rental.daos.PropertyDao;
import com.rental.daos.UserDao;
import com.rental.dto.AddPropertyDto;
import com.rental.dto.PropertyResponseDto;
import com.rental.entity.Property;
import com.rental.entity.PropertyType;
import com.rental.entity.User;
import com.rental.security.JwtUtil;
import com.rental.dto.PropertyImageResponseDto;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class PropertyServiceImpl {
	
	private PropertyDao propertyDao;
    private UserDao userDao;
    private ModelMapper modelMapper;
    
    @Autowired
	public PropertyServiceImpl(PropertyDao propertyDao, UserDao userDao, ModelMapper modelMapper , JwtUtil jwtUtil) {
		super();
		this.propertyDao = propertyDao;
		this.userDao = userDao;
		this.modelMapper = modelMapper;
	}
	
	 // POST /properties
    public PropertyResponseDto addProperty(AddPropertyDto dto) {

        String email = SecurityContextHolder
        		.getContext()
        		.getAuthentication()
        		.getName();

        User owner = userDao.findByEmail(email);

        if(owner == null) {
            throw new RuntimeException("Owner not found");
        }

        Property property = modelMapper.map(dto, Property.class);

        property.setPropertyId(null);
        property.setOwner(owner);
        property.setCreatedAt(LocalDateTime.now());

        property = propertyDao.save(property);

        return convertToDto(property);
    }

	
    // GET /properties

    public List<PropertyResponseDto> getAllProperties() {

        return propertyDao.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }
    
   // GET /properties/{id}
//
//    public PropertyResponseDto getPropertyById(Long propertyId) {
//
//        Property property = propertyDao.findById(propertyId)
//                .orElseThrow(() ->
//                        new RuntimeException("Property not found"));
//
//        return modelMapper.map(property, PropertyResponseDto.class);
//    }
//    
	
	public PropertyResponseDto getPropertyById(Long propertyId) {

	    Property property = propertyDao.findById(propertyId)
	            .orElseThrow(() ->
	                    new RuntimeException("Property not found"));

	    PropertyResponseDto dto = modelMapper.map(property, PropertyResponseDto.class);

	    if (property.getImages() != null && !property.getImages().isEmpty()) {
	        dto.setImageUrl(property.getImages().get(0).getImageUrl());
	    }

	    return dto;
	}
 
    // PUT /properties/{id}
    public Property updateProperty(Long propertyId,AddPropertyDto dto) {

        Property property = propertyDao.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found"));

        modelMapper.map(dto, property);

        return propertyDao.save(property);
    }

    
    // DELETE /properties/{id}
    public void deleteProperty(Long propertyId) {

        Property property = propertyDao.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found"));

        propertyDao.delete(property);
    }
    
    
 // GET /properties?city=Pune
    public List<PropertyResponseDto> getPropertiesByCity(String city) {

        return propertyDao.findByCity(city)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    
 // GET /properties?type=APARTMENT
    public List<PropertyResponseDto> getPropertiesByType(
            PropertyType propertyType) {

        return propertyDao.findByPropertyType(propertyType)
                .stream()
                .map(this::convertToDto)
                .toList();
    }
    
    
 // GET /properties?city=Pune&type=APARTMENT
    public List<PropertyResponseDto> getPropertiesByCityAndType(
            String city,
            PropertyType propertyType) {

        return propertyDao.findByCityAndPropertyType(city,propertyType)
                .stream()
                .map(this::convertToDto)
                .toList();
    }
    
    private PropertyResponseDto convertToDto(Property property) {

        System.out.println("Property ID: " + property.getPropertyId());

        if (property.getImages() == null) {
            System.out.println("Images = null");
        } else {
            System.out.println("Images Count = " + property.getImages().size());
            property.getImages().forEach(img ->
                System.out.println("Image = " + img.getImageUrl())
            );
        }

        PropertyResponseDto dto = modelMapper.map(property, PropertyResponseDto.class);

        if (property.getImages() != null) {
            dto.setImages(
                property.getImages()
                        .stream()
                        .map(image -> modelMapper.map(image, PropertyImageResponseDto.class))
                        .toList()
            );
        }

        return dto;
    }
    
    public List<PropertyResponseDto> getOwnerProperties() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User owner = userDao.findByEmail(email);

        return propertyDao.findByOwner(owner)
                .stream()
                .map(property -> {

                    PropertyResponseDto dto =
                            modelMapper.map(property, PropertyResponseDto.class);

                    if (property.getImages() != null &&
                        !property.getImages().isEmpty()) {

                        dto.setImageUrl(
                                property.getImages().get(0).getImageUrl()
                        );
                    }

                    return dto;
                })
                .toList();
    }
    

}
