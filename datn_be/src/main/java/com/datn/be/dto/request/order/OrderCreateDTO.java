package com.datn.be.dto.request.order;

import com.datn.be.util.annotation.PhoneNumber;
import com.datn.be.util.constant.OrderStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderCreateDTO {
    @NotBlank
    String receiverName;
    @PhoneNumber
    @NotBlank
    String receiverPhone;
    @NotBlank
    String receiverAddress;

    float totalPrice;

    String paymentMethod;

    OrderStatus status;

    long userId;

    private String voucherCode;

    List<OderDetail> orderDetails;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OderDetail {
        @NotBlank
        String productName;

        @NotNull
        @Min(1)
        float price;

        float discount;

        @Min(1)
        long productId;

        @Min(1)
        int quantity;

    }
}
