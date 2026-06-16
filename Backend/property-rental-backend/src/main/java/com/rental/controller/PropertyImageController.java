package com.rental.controller;

import java.io.IOException;

import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import com.rental.dto.Resp;
import com.rental.service.PropertyImageServiceImpl;

@RestController
@RequestMapping("/properties/images")
public class PropertyImageController {

    private PropertyImageServiceImpl imageService;

    public PropertyImageController( PropertyImageServiceImpl imageService) {

        this.imageService = imageService;
    }

    

    // Get Images
    @GetMapping("/{propertyId}")
    public Resp<?> getImages(@PathVariable Long propertyId) {

        return Resp.success(imageService.getImagesByProperty(propertyId));
    }

    
}