package com.shopsphere.order;

import com.shopsphere.product.Product;
import com.shopsphere.product.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final ProductRepository products;
    public OrderController(ProductRepository products) { this.products = products; }

    // Educational demo: production checkout must authenticate the customer and lock inventory rows.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String, Object> create(@Valid @RequestBody OrderRequest request) {
        BigDecimal total = BigDecimal.ZERO;
        List<Map<String, Object>> lines = new ArrayList<>();
        for (OrderRequest.Item item : request.items()) {
            Product p = products.findById(item.productId())
                .filter(Product::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + item.productId()));
            if (p.getStockQuantity() < item.quantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient stock for " + p.getName());
            }
            p.setStockQuantity(p.getStockQuantity() - item.quantity());
            BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(item.quantity()));
            total = total.add(lineTotal);
            lines.add(Map.of("productId", p.getId(), "name", p.getName(),
                "quantity", item.quantity(), "unitPrice", p.getPrice(), "lineTotal", lineTotal));
        }
        // This starter returns a checkout preview; persistence of orders/order_items is a next milestone.
        return Map.of("status", "PENDING_DEMO", "customerName", request.customerName(),
            "customerEmail", request.customerEmail(), "items", lines, "total", total,
            "message", "Demo order validated. Add persisted order entities and a payment provider before production.");
    }
}
