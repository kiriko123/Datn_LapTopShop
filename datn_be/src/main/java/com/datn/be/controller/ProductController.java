package com.datn.be.controller;

import com.datn.be.dto.request.product.ProductCreateDTO;
import com.datn.be.dto.request.product.ProductUpdateDTO;
import com.datn.be.dto.response.RestResponse;
import com.datn.be.model.Product;
import com.datn.be.service.ProductService;
import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/product")
@Validated
public class ProductController {
    private final ProductService productService;

    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductCreateDTO productCreateDTO) {
        log.info("Creating product {}", productCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(productCreateDTO));
    }
    @PutMapping
    public ResponseEntity<?> updateProduct(@Valid @RequestBody ProductUpdateDTO productUpdateDTO) {
        log.info("Updating product {}", productUpdateDTO);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(productService.update(productUpdateDTO));
    }
    @DeleteMapping("/{id}")
    public RestResponse<?> deleteProduct(@Min(1) @PathVariable long id) {
        log.info("Delete product : {}", id);
        productService.delete(id);
        return RestResponse.builder()
                .statusCode(204)
                .message("Product deleted")
                .build();
    }
    @GetMapping
    public ResponseEntity<?> getAllProducts(@Filter Specification<Product> specification, Pageable pageable) {
        log.info("Get all products");
        return ResponseEntity.status(HttpStatus.OK).body(productService.findAll(specification, pageable));
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@Min(1) @PathVariable long id) {
        log.info("Get product : {}", id);
        return ResponseEntity.ok(productService.getProduct(id));
    }
    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }
}
