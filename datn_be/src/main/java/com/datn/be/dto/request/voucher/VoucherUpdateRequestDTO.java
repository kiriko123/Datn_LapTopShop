package com.datn.be.dto.request.voucher;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class VoucherUpdateRequestDTO {

    @NotNull
    long id;
    @NotBlank
    String voucherCode;
    @NotNull
    @PositiveOrZero
    float voucherValue;
    float priceApply;
    String description;

    @NotNull
    Instant startDate;

    @NotNull
    Instant endDate;

    boolean active;
}
