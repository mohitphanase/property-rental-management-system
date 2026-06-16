package com.rental.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rental.entity.PropertyType;

import lombok.Data;

@Data
public class PropertyResponseDto {

    private Long propertyId;

    private String title;

    private String description;

    private String city;

    private BigDecimal price;

    private PropertyType propertyType;

}