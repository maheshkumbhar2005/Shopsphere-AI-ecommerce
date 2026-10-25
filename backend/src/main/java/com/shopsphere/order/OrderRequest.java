package com.shopsphere.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record OrderRequest(
    @NotBlank @Size(max = 120) String customerName,
    @NotBlank @Email @Size(max = 190) String customerEmail,
    @NotEmpty List<@Valid Item> items
) {
    public record Item(@NotNull @Positive Long productId, @Min(1) @Max(50) int quantity) {}
}
