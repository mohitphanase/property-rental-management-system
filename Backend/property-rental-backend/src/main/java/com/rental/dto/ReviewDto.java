package com.rental.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {

    @JsonProperty("property_Id")
    private Long propertyId;
    
    private Long tenantId;
    private Integer rating;
    private String comment;

    // Setter fallback for propertyId field
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }
}