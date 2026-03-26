package com.surplussync.transaction.repository;

import com.surplussync.transaction.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByListingId(Long listingId);

    List<Claim> findByClaimStatus(String claimStatus);
}
