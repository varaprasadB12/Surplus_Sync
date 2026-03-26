package com.surplussync.transaction.controller;

import com.surplussync.transaction.entity.Claim;
import com.surplussync.transaction.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/claims")
@Tag(name = "Transactions", description = "Claims API")
public class ClaimController {

    private final ClaimService service;

    public ClaimController(ClaimService service) {
        this.service = service;
    }

    @Operation(summary = "Submit a claim", description = "An NGO or individual submits a claim for a food listing. Calls inventory-service to decrement quantity atomically. Returns 409 if the listing is unavailable or quantity is insufficient.")
    @PostMapping
    public ResponseEntity<Claim> submit(@RequestBody Claim claim) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.submit(claim));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @Operation(summary = "Get all claims", description = "Returns every claim across all listings.")
    @GetMapping
    public List<Claim> findAll() {
        return service.findAll();
    }

    @Operation(summary = "Get claim by ID", description = "Returns a single claim by its database ID.")
    @GetMapping("/{id}")
    public Claim findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @Operation(summary = "Get claims by listing", description = "Returns all claims submitted against a specific food listing ID.")
    @GetMapping("/listing/{listingId}")
    public List<Claim> findByListingId(@PathVariable Long listingId) {
        return service.findByListingId(listingId);
    }
}
