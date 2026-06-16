package com.rental.service;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.rental.daos.PropertyDao;
import com.rental.daos.PropertyImageDao;
import com.rental.dto.PropertyImageResponseDto;
import com.rental.entity.Property;
import com.rental.entity.PropertyImage;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class PropertyImageServiceImpl {

    private PropertyDao propertyDao;
    private PropertyImageDao propertyImageDao;
    private ModelMapper modelMapper;

    public PropertyImageServiceImpl(
            PropertyDao propertyDao,
            PropertyImageDao propertyImageDao,
            ModelMapper modelMapper) {

        this.propertyDao = propertyDao;
        this.propertyImageDao = propertyImageDao;
        this.modelMapper = modelMapper;
    }

    // Upload Image
    public PropertyImageResponseDto uploadImage(Long propertyId,MultipartFile file) throws IOException {

        Property property = propertyDao.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found"));

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        if (!property.getOwner().getEmail().equals(email)) {

            throw new RuntimeException("You can upload images only to your properties");
        }

        String uploadPath = System.getProperty("user.dir")
                + File.separator
                + "uploads";

        File uploadDir = new File(uploadPath);

        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String fileName =
                UUID.randomUUID()
                + "_"
                + file.getOriginalFilename();

        File destinationFile =
                new File(uploadDir, fileName);

        file.transferTo(destinationFile);

        PropertyImage image = new PropertyImage();

        image.setProperty(property);
        image.setImageUrl("uploads/" + fileName);

        image = propertyImageDao.save(image);

        return modelMapper.map(
                image,
                PropertyImageResponseDto.class);
    }

    // Get Images By Property
    public List<PropertyImageResponseDto> getImagesByProperty(Long propertyId) {

        Property property = propertyDao.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found"));

        return propertyImageDao.findByProperty(property)
                .stream()
                .map(image ->
                        modelMapper.map(
                                image,
                                PropertyImageResponseDto.class))
                .collect(Collectors.toList());
    }

    // Delete Image
    public void deleteImage(Long imageId) {

        PropertyImage image = propertyImageDao.findById(imageId)
                .orElseThrow(() ->
                        new RuntimeException("Image not found"));

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        if (!image.getProperty()
                .getOwner()
                .getEmail()
                .equals(email)) {

            throw new RuntimeException(
                    "You can delete images only from your properties");
        }

        propertyImageDao.delete(image);
    }
}