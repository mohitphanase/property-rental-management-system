package com.rental.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_id")
    private Long propertyId;

    // Many Properties -> One Owner(User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private User owner;

    @Column
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String address;

    @Column
    private String city;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type")
    private PropertyType propertyType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PropertyImage> images;
}