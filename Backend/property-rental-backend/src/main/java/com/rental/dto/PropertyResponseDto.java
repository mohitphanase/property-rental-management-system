package com.rental.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.rental.entity.PropertyType;

import lombok.Data;

@Data
public class PropertyResponseDto {

    private Long propertyId;
    private String title;
    private String city;
    private Double price;
    private String description;
    private String propertyType;

    private Long ownerId;
    private String ownerName;
    private String ownerPhone;

    private List<PropertyImageResponseDto> images;
}