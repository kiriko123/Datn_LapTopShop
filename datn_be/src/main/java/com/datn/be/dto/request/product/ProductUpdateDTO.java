package com.datn.be.dto.request.product;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateDTO {

    @Min(1)
    long id;

    @NotBlank
    String name;

    @Min(1)
    float price;

    @Min(0)
    @Max(100)
    float discount;

    String thumbnail;

    @Min(0)
    int quantity;

    @Min(0)
    int sold;

    String description;

    boolean active;

    boolean sale;

    boolean hot;

    List<String> images;

    long categoryId;

    long brandId;
}
