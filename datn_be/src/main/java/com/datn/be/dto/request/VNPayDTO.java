package com.datn.be.dto.request;

import lombok.Builder;

public abstract class VNPayDTO {
    @Builder
    public static class VNPayResponse {
        public String code;
        public String message;
        public String paymentUrl;

        // Constructor phải được khai báo `public`
        public VNPayResponse(String code, String message, String paymentUrl) {
            this.code = code;
            this.message = message;
            this.paymentUrl = paymentUrl;
        }
    }
}
