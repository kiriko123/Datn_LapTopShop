package com.datn.be.dto.response.order;
import com.datn.be.model.Order;
import com.datn.be.model.OrderDetail;
import com.datn.be.util.constant.OrderStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {

    long id;
    String orderNumber;

    String receiverName;
    String receiverPhone;
    String receiverAddress;
    float totalPrice;

    User user;

    String paymentMethod;

    OrderStatus status;

    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
    String description;

    List<OrderDetailResponse> orderDetails;
    // Thêm thông tin voucher vào OrderResponse
    String voucherCode;  // Mã voucher
    float voucherValue;  // Giá trị voucher


    @Getter
    @Setter
    @Builder
    public static class User{
        Long id;
        String email;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderDetailResponse{
        long id;

        String productName;
        float price;
        float discount;
        int quantity;
        String thumbnail;

        public static OrderDetailResponse fromOrderDetail(OrderDetail orderDetail) {
            return OrderDetailResponse.builder()
                    .id(orderDetail.getId())
                    .productName(orderDetail.getProductName())
                    .price(orderDetail.getPrice())
                    .discount(orderDetail.getDiscount())
                    .quantity(orderDetail.getQuantity())
                    .thumbnail(orderDetail.getProduct().getThumbnail())
                    .build();
        }
    }
    public static OrderResponse fromOrder(Order order, List<OrderDetailResponse> orderDetails, String voucherCode, float voucherValue) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .receiverAddress(order.getReceiverAddress())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .description(order.getDescription())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .createdBy(order.getCreatedBy())
                .updatedBy(order.getUpdatedBy())
                .user(
                        User.builder()
                                .id(order.getUser().getId())
                                .email(order.getUser().getEmail())
                                .build()
                )
                .orderDetails(orderDetails)
                // Thêm thông tin voucher vào OrderResponse
                .voucherCode(order.getVoucherCode())  // Trả về mã voucher
                .voucherValue(order.getVoucherValue())
                .build();
    }
}
