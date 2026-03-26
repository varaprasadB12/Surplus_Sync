package com.surplussync.inventory.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_listings")
public class FoodListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String restaurantName;

    @Column(nullable = false)
    private String itemDescription;

    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String status = "AVAILABLE";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public FoodListing() {}

    public Long getId() { return id; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
