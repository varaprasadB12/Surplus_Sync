package com.surplussync.inventory.repository;

import com.surplussync.inventory.entity.FoodListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FoodListingRepository extends JpaRepository<FoodListing, Long> {

    List<FoodListing> findByStatus(String status);

    @Query("SELECT l FROM FoodListing l WHERE l.status = 'AVAILABLE' AND l.createdAt < :cutoff")
    List<FoodListing> findAvailableOlderThan(@Param("cutoff") LocalDateTime cutoff);
}
