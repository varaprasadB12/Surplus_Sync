package com.surplussync.inventory.controller;

import com.surplussync.inventory.entity.FoodListing;
import com.surplussync.inventory.service.FoodListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/listings")
@Tag(name = "Inventory", description = "Food Listing API")
public class FoodListingController {

    private final FoodListingService service;

    public FoodListingController(FoodListingService service) {
        this.service = service;
    }

    @Operation(summary = "Create a food listing", description = "Allows a restaurant to post a new surplus food listing with quantity and description.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FoodListing create(@RequestBody FoodListing listing) {
        return service.create(listing);
    }

    @Operation(summary = "Get all listings", description = "Returns every food listing regardless of status.")
    @GetMapping
    public List<FoodListing> findAll() {
        return service.findAll();
    }

    @Operation(summary = "Get available listings", description = "Returns only listings with status AVAILABLE, i.e. food that has not yet been fully claimed.")
    @GetMapping("/available")
    public List<FoodListing> findAvailable() {
        return service.findAvailable();
    }

    @Operation(summary = "Get listing by ID", description = "Returns a single food listing by its database ID.")
    @GetMapping("/{id}")
    public FoodListing findById(@PathVariable Long id) {
        return service.findById(id);
    }
}
