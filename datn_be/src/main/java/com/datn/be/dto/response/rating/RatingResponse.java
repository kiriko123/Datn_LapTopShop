package com.datn.be.dto.response.rating;


import com.datn.be.model.Rating;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingResponse {

    private Long id;
    private String content;
    private int numberStars;
    private String userName;
    private String adminResponse;

    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;

    public static RatingResponse fromRatingToRatingResponse(Rating rating) {
        RatingResponse ratingResponse = RatingResponse.builder()
                .id(rating.getId())
                .content(rating.getContent())
                .numberStars(rating.getNumberStars())
                .adminResponse(rating.getAdminRespone())
                .createdAt(rating.getCreatedAt())
                .updatedAt(rating.getUpdatedAt())
                .createdBy(rating.getCreatedBy())
                .updatedBy(rating.getUpdatedBy())
                .build();
        return ratingResponse;
    }

}
