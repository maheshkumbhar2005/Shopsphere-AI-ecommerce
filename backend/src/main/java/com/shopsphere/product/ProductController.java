package com.shopsphere.product;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository repository;
    public ProductController(ProductRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Product> list(@RequestParam(required = false) String q) {
        if (q == null || q.isBlank()) return repository.findByActiveTrueOrderByIdAsc();
        return repository.findByActiveTrueAndNameContainingIgnoreCaseOrderByIdAsc(q.trim());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable Long id) {
        return repository.findById(id).filter(Product::isActive)
            .map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
