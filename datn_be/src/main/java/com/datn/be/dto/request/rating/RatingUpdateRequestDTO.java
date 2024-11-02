package com.datn.be.dto.request.rating;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class RatingUpdateRequestDTO {
    @NotNull
    long id;
    @NotBlank
    String adminRespone;
}
