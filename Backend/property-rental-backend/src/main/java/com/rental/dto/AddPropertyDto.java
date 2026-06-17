package com.rental.dto;

import java.math.BigDecimal;

import com.rental.entity.PropertyType;

import lombok.Data;

@Data
public class AddPropertyDto {

    private String title;

    private String description;

    private String address;

    private String city;

    private BigDecimal price;

    private PropertyType propertyType;
}