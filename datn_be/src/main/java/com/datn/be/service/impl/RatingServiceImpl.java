package com.datn.be.service.impl;

import com.datn.be.dto.request.rating.RatingUpdateRequestDTO;
import com.datn.be.dto.response.rating.RatingResponse;
import com.datn.be.exception.ResourceNotFoundException;
import com.datn.be.model.Product;
import com.datn.be.model.Rating;
import com.datn.be.model.User; // Import User model
import com.datn.be.repository.ProductRepository;
import com.datn.be.repository.RatingRepository;
import com.datn.be.repository.UserRepository; // Import UserRepository
import com.datn.be.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository; // Khai báo UserRepository

//    public RatingServiceImpl(RatingRepository ratingRepository, ProductRepository productRepository, UserRepository userRepository) {
//        this.ratingRepository = ratingRepository;
//        this.productRepository = productRepository;
//        this.userRepository = userRepository; // Khởi tạo UserRepository
//    }

    @Override
    public List<Rating> getRatingsByProduct(Long productId) {
        return ratingRepository.findByProductId(productId);
    }

    @Override
    public Rating addRating(Long productId, Rating rating, String username) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Tìm người dùng từ username
        User user = userRepository.findByEmail(username);
        if (user != null) {
            rating.setUser(user); // Gán người dùng vào đối tượng rating
        } else {
            throw new IllegalArgumentException("User not found");
        }

        rating.setProduct(product);
        rating.setCreatedAt(Instant.now());
        return ratingRepository.save(rating); // Lưu rating và trả về
    }

    @Override
    public RatingResponse update(RatingUpdateRequestDTO ratingUpdateRequestDTO) {
        Rating rating = this.getRatingById(ratingUpdateRequestDTO.getId());
        rating.setAdminRespone(ratingUpdateRequestDTO.getAdminRespone());

        return RatingResponse.fromRatingToRatingResponse(ratingRepository.save(rating));
    }

    @Override
    public Rating getRatingById(Long id) {
        return ratingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Rating not found"));
    }


    @Override
    public void deleteRating(Long id) {
        ratingRepository.deleteById(id);
    }
}
