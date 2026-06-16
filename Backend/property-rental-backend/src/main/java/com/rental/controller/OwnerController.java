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
@RequestMapping("/owner/properties")
public class OwnerController {
	
	private PropertyServiceImpl propertyService;

    @Autowired
    public OwnerController(PropertyServiceImpl propertyService) {
        this.propertyService = propertyService;
    }
    
    
    
    // POST /properties

    @PostMapping
    public Resp<?> addProperty(@RequestBody AddPropertyDto dto) {

        return Resp.success(propertyService.addProperty(dto));
    }
       
    
   // PUT /properties/{id}
    @PutMapping("/{id}")
    public Resp<?> updateProperty( @PathVariable Long id, @RequestBody AddPropertyDto dto) {

        return Resp.success(propertyService.updateProperty(id, dto));
    }
    
    
    // DELETE /properties/{id}
    @DeleteMapping("/{id}")
    public Resp<?> deleteProperty(@PathVariable Long id) {

        propertyService.deleteProperty(id);

        return Resp.success("Property deleted successfully");
    }
}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    


