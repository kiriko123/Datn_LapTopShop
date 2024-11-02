package com.datn.be.controller;

import com.datn.be.dto.request.brand.BrandUpdateRequestDTO;
import com.datn.be.dto.request.rating.RatingUpdateRequestDTO;
import com.datn.be.model.Rating;
import com.datn.be.model.User;
import com.datn.be.service.RatingService;
import com.datn.be.util.SecurityUtil; // Import SecurityUtil để lấy thông tin người dùng hiện tại
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/ratings")
public class RatingController {
    private final RatingService ratingService;

//    public RatingController(RatingService ratingService) {
//        this.ratingService = ratingService;
//    }

    @GetMapping("/{productId}")
    public ResponseEntity<List<Rating>> getRatingsByProduct(@PathVariable Long productId) {
        List<Rating> ratings = ratingService.getRatingsByProduct(productId);
        return ResponseEntity.ok(ratings);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Rating> addRating(@PathVariable Long productId, @RequestBody Rating rating) {
        // Lấy thông tin người dùng hiện tại
        String username = SecurityUtil.getCurrentUserLogin().orElse(null); // Lấy username từ SecurityUtil

        if (username == null) {
            return ResponseEntity.status(403).body(null); // Trả về lỗi 403 nếu không có người dùng
        }

        // Gọi service để thêm đánh giá với thông tin người dùng
        Rating createdRating = ratingService.addRating(productId, rating, username);
        return ResponseEntity.ok(createdRating);
    }

//    @PutMapping("/{id}")
//    public ResponseEntity<Rating> updateRating(@PathVariable Long id, @RequestBody Rating rating) {
//        Rating updatedRating = ratingService.updateRating(id, rating);
//        return ResponseEntity.ok(updatedRating);
//    }
@PutMapping
public ResponseEntity<?> updateRating(@Valid @RequestBody RatingUpdateRequestDTO ratingUpdateRequestDTO){
    log.info("Update Rating: {}", ratingUpdateRequestDTO);
    return ResponseEntity.status(HttpStatus.ACCEPTED).body(ratingService.update(ratingUpdateRequestDTO));
}


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable Long id) {
        ratingService.deleteRating(id);
        return ResponseEntity.noContent().build();
    }
}
