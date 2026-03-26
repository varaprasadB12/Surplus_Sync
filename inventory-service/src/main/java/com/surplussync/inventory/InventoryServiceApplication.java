package com.surplussync.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * SurplusSync Inventory Service.
 *
 * <p>Owns the food listing lifecycle: restaurants post surplus food here.
 * Persists to its own PostgreSQL schema (inventory_db) — no shared database
 * with the transaction service, enforcing microservice data isolation.</p>
 */
@SpringBootApplication
public class InventoryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventoryServiceApplication.class, args);
    }
}
