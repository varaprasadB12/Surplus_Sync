package com.surplussync.inventory.service;

import com.surplussync.inventory.entity.FoodListing;
import com.surplussync.inventory.repository.FoodListingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class FoodListingService {

    private final FoodListingRepository repository;

    public FoodListingService(FoodListingRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public FoodListing create(FoodListing listing) {
        return repository.save(listing);
    }

    public List<FoodListing> findAll() {
        return repository.findAll();
    }

    public FoodListing findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found: " + id));
    }

    public List<FoodListing> findAvailable() {
        return repository.findByStatus("AVAILABLE");
    }
}
