package com.rental.controller;

import java.io.IOException;

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
import org.springframework.web.multipart.MultipartFile;

import com.rental.dto.AddPropertyDto;
import com.rental.dto.BookingStatusDto;
import com.rental.dto.Resp;
import com.rental.entity.Booking;
import com.rental.entity.PropertyType;
import com.rental.service.BookingService;
import com.rental.service.PropertyImageServiceImpl;
import com.rental.service.PropertyServiceImpl;

@RestController
@RequestMapping("/owner/properties")
public class OwnerController {
	
	private PropertyServiceImpl propertyService;
	private PropertyImageServiceImpl imageService;
	private BookingService bookingService;

    @Autowired
    public OwnerController(PropertyServiceImpl propertyService,PropertyImageServiceImpl imageService,BookingService bookingService) {
        this.propertyService = propertyService;
        this.imageService = imageService;
        this.bookingService = bookingService;
    }
    
    
    
    //Add Property
    @PostMapping
    public Resp<?> addProperty(@RequestBody AddPropertyDto dto) {

        return Resp.success(propertyService.addProperty(dto));
    }
       
    
   // Update Property
    @PutMapping("/{id}")
    public Resp<?> updateProperty( @PathVariable Long id, @RequestBody AddPropertyDto dto) {

        return Resp.success(propertyService.updateProperty(id, dto));
    }
    
    
    // DELETE property
    @DeleteMapping("/{id}")
    public Resp<?> deleteProperty(@PathVariable Long id) {

        propertyService.deleteProperty(id);

        return Resp.success("Property deleted successfully");
    }
    
    
    
    
    // Upload Image
    @PostMapping("/{propertyId}/images")
    public Resp<?> uploadImage(@PathVariable Long propertyId, @RequestParam MultipartFile file) throws IOException {
    	
        return Resp.success(imageService.uploadImage(propertyId, file));
    }
    
    // Delete Image
    @DeleteMapping("/images/{imageId}")
    public Resp<?> deleteImage(@PathVariable Long imageId) {

        imageService.deleteImage(imageId);

        return Resp.success("Image deleted successfully");
    }
    
    
    // Set Booking Status
    @PutMapping("/bookings/{bookingId}/status")
    public Resp<?> updateBookingStatus( @PathVariable Long bookingId, @RequestBody BookingStatusDto dto) {

        Booking booking = bookingService.updateBookingStatus(bookingId, dto.getStatus());

        return Resp.success(booking);
    }
    
    // get owner booking
    @GetMapping("/bookings")
    public Resp<?> getOwnerBookings() {

        return Resp.success(
                bookingService.getOwnerBookings());
    }
}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    


