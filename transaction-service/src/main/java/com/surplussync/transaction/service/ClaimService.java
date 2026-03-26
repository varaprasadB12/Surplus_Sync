package com.surplussync.transaction.service;

import com.surplussync.transaction.entity.Claim;
import com.surplussync.transaction.repository.ClaimRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ClaimService {

    private final ClaimRepository repository;

    public ClaimService(ClaimRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Claim submit(Claim claim) {
        return repository.save(claim);
    }

    public List<Claim> findAll() {
        return repository.findAll();
    }

    public Claim findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found: " + id));
    }

    public List<Claim> findByListingId(Long listingId) {
        return repository.findByListingId(listingId);
    }
}
