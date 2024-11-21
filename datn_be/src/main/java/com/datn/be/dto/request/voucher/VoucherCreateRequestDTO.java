package com.datn.be.dto.request.voucher;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;

import java.time.Instant;

@Getter
public class VoucherCreateRequestDTO {

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
