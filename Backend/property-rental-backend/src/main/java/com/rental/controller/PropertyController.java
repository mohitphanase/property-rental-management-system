package com.rental.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rental.dto.AddPropertyDto;
import com.rental.dto.Resp;
import com.rental.entity.PropertyType;
import com.rental.service.PropertyServiceImpl;

@RestController
@RequestMapping("/properties")
public class PropertyController {
	
	private PropertyServiceImpl propertyService;

    @Autowired
    public PropertyController(PropertyServiceImpl propertyService) {
        this.propertyService = propertyService;
    }
    
    //get property
    @GetMapping
    public Resp<?> getProperties(

            @RequestParam(required = false)
            String city,

            @RequestParam(required = false)
            PropertyType type
            
            ) {

        if (city != null && type != null) {

            return Resp.success(
                    propertyService
                    .getPropertiesByCityAndType(
                            city,
                            type));
        }

        if (city != null) {

            return Resp.success(
                    propertyService
                    .getPropertiesByCity(city));
        }

        if (type != null) {

            return Resp.success(
                    propertyService
                    .getPropertiesByType(type));
        }

        return Resp.success(
                propertyService
                .getAllProperties());
    }


    
    // GET /properties/{id}
    @GetMapping("/{id}")
    public Resp<?> getPropertyById(@PathVariable Long id) {

        return Resp.success(propertyService.getPropertyById(id));
    }
    
    @GetMapping("/details/{id}")
    public Resp<?> getPropertyDetails(@PathVariable Long id) {

        return Resp.success(propertyService.getPropertyDetails(id));
    }
}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    


