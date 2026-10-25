package com.shopsphere.product;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "image_url") private String imageUrl;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal price;
    @Column(name = "stock_quantity", nullable = false) private int stockQuantity;
    @Column(nullable = false) private boolean active;

    protected Product() {}
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public BigDecimal getPrice() { return price; }
    public int getStockQuantity() { return stockQuantity; }
    public boolean isActive() { return active; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
}
