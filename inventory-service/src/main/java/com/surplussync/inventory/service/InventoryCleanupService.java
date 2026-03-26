gtpackage com.surplussync.inventory.service;

import com.surplussync.inventory.entity.FoodListing;
import com.surplussync.inventory.repository.FoodListingRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class InventoryCleanupService {

    private final FoodListingRepository repository;

    public InventoryCleanupService(FoodListingRepository repository) {
        this.repository = repository;
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void expireStaleListings() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(12);
        List<FoodListing> stale = repository.findAvailableOlderThan(cutoff);
        stale.forEach(listing -> listing.setStatus("EXPIRED"));
        repository.saveAll(stale);
    }
}
